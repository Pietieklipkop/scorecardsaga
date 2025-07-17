
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

    if (!accountSid || !authToken || !fromNumber) {
        const errorMsg = "Twilio credentials are not configured in environment variables.";
        console.error(errorMsg);
        await addDoc(collection(db, "whatsapp_logs"), {
            to: input.to,
            message: input.message,
            success: false,
            messageId: null,
            error: errorMsg,
            timestamp: serverTimestamp(),
        });
        return { success: false, error: errorMsg };
    }
    
    try {
        // Normalize the recipient's phone number if it's in a local format
        let normalizedTo = input.to.trim();
        if (normalizedTo.startsWith('0') && (normalizedTo.length === 10 || normalizedTo.length === 9)) {
            normalizedTo = `+27${normalizedTo.substring(1)}`;
        }

        const to_number = `whatsapp:${normalizedTo}`;
        
        // The 'from' number should be used directly from the environment variable
        // as configured in the Twilio WhatsApp Sandbox, which usually includes the 'whatsapp:' prefix.
        const from_number = fromNumber;

        const client = new Twilio(accountSid, authToken);

        const message = await client.messages.create({
            from: from_number,
            to: to_number,
            body: input.message,
        });

        await addDoc(collection(db, "whatsapp_logs"), {
            to: input.to,
            message: input.message,
            success: true,
            messageId: message.sid,
            error: null,
            timestamp: serverTimestamp(),
        });
        
        return { success: true, messageId: message.sid };

    } catch (error: any) {
        // Handle the specific "queued" case (30007) as a success.
        if (error.code === 30007) {
            const queuedMessage = 'Message has been queued for delivery.';
            await addDoc(collection(db, "whatsapp_logs"), {
                to: input.to,
                message: input.message,
                success: true, // Treat as success
                messageId: null, // SID might not be available yet
                error: `Status: Queued. (Twilio code: 30007)`,
                timestamp: serverTimestamp(),
            });
            // Return success to the client but with an informational error message.
            return { success: true, error: queuedMessage };
        }

        const errorMessage = error instanceof Error ? (error.stack || error.message) : String(error);
        console.error('Failed to send Twilio message:', errorMessage);
        
        await addDoc(collection(db, "whatsapp_logs"), {
            to: input.to,
            message: input.message,
            success: false,
            messageId: null,
            error: errorMessage,
            timestamp: serverTimestamp(),
        });
        
        return { success: false, error: errorMessage };
    }
  }
);
