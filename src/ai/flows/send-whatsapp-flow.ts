
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
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


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

    let result: SendWhatsappOutput;
    
    try {
        if (!accountSid || !authToken || !fromNumber) {
            throw new Error("Twilio credentials are not configured in environment variables.");
        }

        // Format the 'To' number to E.164
        let formattedToNumber = input.to.trim();
        if (formattedToNumber.startsWith('0')) {
          // Assuming a South African number if it starts with 0
          formattedToNumber = `+27${formattedToNumber.substring(1)}`;
        } else if (!formattedToNumber.startsWith('+')) {
          // Add '+' if it's missing, assuming country code is included
          formattedToNumber = `+${formattedToNumber}`;
        }

        // Ensure the 'From' number is correctly prefixed for WhatsApp
        const formattedFromNumber = fromNumber.startsWith('whatsapp:') 
          ? fromNumber 
          : `whatsapp:${fromNumber}`;


        const client = new Twilio(accountSid, authToken);

        const message = await client.messages.create({
            from: formattedFromNumber,
            to: `whatsapp:${formattedToNumber}`,
            body: input.message,
        });

        console.log('Message sent successfully with SID:', message.sid);
        result = { success: true, messageId: message.sid };
    } catch (error: any) {
        console.error('Failed to send Twilio message:', error);
        result = { success: false, error: error.message };
    }

    // Log the result to Firestore
    try {
      await addDoc(collection(db, "whatsapp_logs"), {
        to: input.to,
        message: input.message,
        success: result.success,
        messageId: result.messageId || null,
        error: result.error || null,
        timestamp: serverTimestamp(),
      });
    } catch (logError) {
      console.error("Failed to write to whatsapp_logs:", logError);
    }

    return result;
  }
);
