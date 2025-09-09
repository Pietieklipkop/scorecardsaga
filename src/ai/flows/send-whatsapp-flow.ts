
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
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Ensure environment variables are loaded
import 'dotenv/config';


const SendWhatsappInputSchema = z.object({
  to: z.string().describe('The recipient phone number in E.164 format.'),
  template: z.string().describe('The pre-approved Twilio template SID (HX...) to send.'),
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
    const fromNumber = "+27690087576"; // Hardcoded Twilio number

    const payload = {
        contentSid: input.template,
        from: `whatsapp:${fromNumber}`,
        to: `whatsapp:${input.to}`,
    };

    if (!accountSid || !authToken) {
      const error = "Twilio Account SID or Auth Token are not configured in environment variables.";
      // Log failure to Firestore
      try {
        await addDoc(collection(db, "whatsapp_logs"), {
            to: input.to,
            message: input.template, // Log template name
            success: false,
            error: error,
            timestamp: serverTimestamp(),
            payload: payload,
        });
      } catch (logError) {
          console.error("Failed to log whatsapp failure to firestore:", logError)
      }
      return { success: false, error };
    }
    
    try {
      const client = new Twilio(accountSid, authToken);

      console.log("Sending payload to Twilio:", JSON.stringify(payload, null, 2));

      const message = await client.messages.create(payload);

      // Log success to Firestore
      await addDoc(collection(db, "whatsapp_logs"), {
        to: input.to,
        message: input.template, // Log template name
        success: true,
        messageId: message.sid,
        timestamp: serverTimestamp(),
        payload: payload,
      });

      return { success: true, messageId: message.sid };
    } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Failed to send Twilio message:', errorMessage);
        
        // Log failure to Firestore
        try {
            await addDoc(collection(db, "whatsapp_logs"), {
                to: input.to,
                message: input.template, // Log template name
                success: false,
                error: errorMessage,
                timestamp: serverTimestamp(),
                payload: payload,
            });
        } catch (logError) {
            console.error("Failed to log whatsapp failure to firestore:", logError)
        }

        return { success: false, error: errorMessage };
    }
  }
);
