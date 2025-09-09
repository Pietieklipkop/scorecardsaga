
'use server';
/**
 * @fileOverview A flow for sending WhatsApp messages via Twilio and logging the attempt.
 *
 * - sendWhatsappMessage - A function that handles sending the message and logging the outcome.
 * - SendWhatsappInput - The input type for the sendWhatsappMessage function.
 * - SendWhatsappOutput - The return type for the sendWhatsappMessage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Twilio } from 'twilio';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';


const SendWhatsappInputSchema = z.object({
  to: z.string().describe('The recipient phone number in E.164 format.'),
  template: z.string().describe('The pre-approved Twilio template name (e.g., competition_entry_success).'),
});
export type SendWhatsappInput = z.infer<typeof SendWhatsappInputSchema>;

const SendWhatsappOutputSchema = z.object({
  success: z.boolean(),
  messageId: z.string().optional(),
  error: z.string().optional(),
});
export type SendWhatsappOutput = z.infer<typeof SendWhatsappOutputSchema>;

export async function sendWhatsappMessage(input: SendWhatsappInput): Promise<SendWhatsappOutput> {
  return sendWhatsappFlow(input);
}

const sendWhatsappFlow = ai.defineFlow(
  {
    name: 'sendWhatsappFlow',
    inputSchema: SendWhatsappInputSchema,
    outputSchema: SendWhatsappOutputSchema,
  },
  async (input) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_SENDER_NUMBER || "+14155238886";

    // IMPORTANT: Replace these placeholder names with your actual HX... SIDs from Twilio
    const templateSids: { [key: string]: string } = {
        'competition_entry_failure': 'HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 
        'competition_entry_success': 'HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        'competition_entry_leaderboard': 'HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    };

    const contentSid = templateSids[input.template];
    
    const payload = {
        contentSid: contentSid,
        from: `whatsapp:${fromNumber}`,
        to: `whatsapp:${input.to}`,
    };
    
    // Log the initial attempt to Firestore immediately
    let logDocRef;
    try {
        const docRef = await addDoc(collection(db, "whatsapp_logs"), {
            to: input.to,
            message: input.template,
            success: false, // Start as false
            error: "pending",
            timestamp: serverTimestamp(),
            payload: payload,
        });
        logDocRef = doc(db, "whatsapp_logs", docRef.id);
    } catch (logError: any) {
        console.error("CRITICAL: Failed to create initial Firestore log entry:", logError.message);
        // If we can't even log, we can't proceed.
        return { success: false, error: "Failed to create initial log entry in Firestore. Check server permissions and configuration." };
    }

    // Now, perform the validation and Twilio call
    if (!accountSid || !authToken) {
      const error = "Twilio Account SID or Auth Token are not configured in environment variables.";
      await updateDoc(logDocRef, { error: error, payload: payload });
      return { success: false, error };
    }
    
    if (!contentSid) {
        const error = `Template name "${input.template}" is not mapped to a valid SID. Check the mapping in send-whatsapp-flow.ts.`;
        await updateDoc(logDocRef, { error: error, payload: payload });
        return { success: false, error };
    }
    
    try {
      const client = new Twilio(accountSid, authToken);
      const message = await client.messages.create(payload);

      // Success! Update the log entry.
      await updateDoc(logDocRef, {
        success: true,
        messageId: message.sid,
        error: null, // Clear pending/error state
      });

      return { success: true, messageId: message.sid };
    } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Failed to send Twilio message:', errorMessage);
        
        // Failure! Update the log entry with the error.
        await updateDoc(logDocRef, {
            error: errorMessage,
        });

        return { success: false, error: errorMessage };
    }
  }
);
