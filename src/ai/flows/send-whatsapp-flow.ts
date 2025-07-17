
'use server';
/**
 * @fileOverview A flow for sending WhatsApp messages via Twilio.
 *
 * - sendWhatsappMessage - A function that handles sending the message.
 * - SendWhatsappInput - The input type for the sendWhatsappMessage function.
 * - SendWhatsappOutput - The return type for the sendWhatsappMessage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Twilio } from 'twilio';

// Ensure environment variables are loaded
import 'dotenv/config';


const SendWhatsappInputSchema = z.object({
  to: z.string().describe('The recipient phone number in E.164 format.'),
  message: z.string().describe('The content of the message to send.'),
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
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
        const errorMsg = "Twilio credentials are not configured in environment variables.";
        console.error(errorMsg);
        return { success: false, error: errorMsg };
    }

    const client = new Twilio(accountSid, authToken);

    try {
        const message = await client.messages.create({
            from: fromNumber,
            to: `whatsapp:${input.to}`,
            body: input.message,
        });

        console.log('Message sent successfully with SID:', message.sid);
        return { success: true, messageId: message.sid };
    } catch (error: any) {
        console.error('Failed to send Twilio message:', error);
        return { success: false, error: error.message };
    }
  }
);
