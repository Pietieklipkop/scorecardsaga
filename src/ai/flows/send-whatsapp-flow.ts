
'use server';
/**
 * @fileOverview A flow for sending WhatsApp messages via Twilio and logging the attempt.
 *
 * - sendWhatsappMessage - A function that handles sending the message and logging.
 * - SendWhatsappInput - The input type for the sendWhatsappMessage function.
 * - SendWhatsappOutput - The return type for the sendWhatsappMessage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Twilio } from 'twilio';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const SendWhatsappInputSchema = z.object({
  to: z.string().describe('The recipient phone number in E.164 format.'),
  template: z.string().describe('The pre-approved Twilio template name (e.g., competition_entry_success).'),
});
export type SendWhatsappInput = z.infer<typeof SendWhatsappInputSchema>;

const SendWhatsappOutputSchema = z.object({
  success: z.boolean(),
  logId: z.string().optional(),
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
    const fromNumber = process.env.TWILIO_SENDER_NUMBER || "+15558511306";

    const templateSids: { [key: string]: string } = {
        'competition_entry_failure': 'HX0ec6a7dd8adf7f5b3de2058944dc4fff', 
        'competition_entry_success': 'HX95d4ea576c704914bc271e6146533d7c',
        'competition_entry_leaderboard': 'HXe56af55a49b8080ca95ea93b6c5ce10',
    };
    
    const contentSid = templateSids[input.template];
    
    let logData: any = {
      to: input.to,
      template: input.template,
      payload: null, // Initialize payload as null
      status: 'pending',
      timestamp: serverTimestamp(),
      error: null,
    };

    if (!accountSid || !authToken) {
      logData.status = 'failure';
      logData.error = "Twilio Account SID or Auth Token are not configured in environment variables.";
      console.error(logData.error);
      const logRef = await addDoc(collection(db, "whatsapp_logs"), logData);
      return { success: false, logId: logRef.id, error: logData.error };
    }

    if (!contentSid || contentSid.startsWith('HXxxxx')) {
      logData.status = 'failure';
      logData.error = `Template name "${input.template}" is not mapped to a valid SID or is still a placeholder.`;
      console.error(logData.error);
      const logRef = await addDoc(collection(db, "whatsapp_logs"), logData);
      return { success: false, logId: logRef.id, error: logData.error };
    }

    const payload = {
        contentSid: contentSid,
        from: `whatsapp:${fromNumber}`,
        to: `whatsapp:${input.to}`,
    };

    logData.payload = payload;
    
    try {
      const client = new Twilio(accountSid, authToken);
      await client.messages.create(payload);
      
      logData.status = 'success';
      const logRef = await addDoc(collection(db, "whatsapp_logs"), logData);
      return { success: true, logId: logRef.id };

    } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Failed to send Twilio message:', errorMessage, 'Payload:', payload);
        
        logData.status = 'failure';
        logData.error = errorMessage;
        const logRef = await addDoc(collection(db, "whatsapp_logs"), logData);
        return { success: false, logId: logRef.id, error: errorMessage };
    }
  }
);
