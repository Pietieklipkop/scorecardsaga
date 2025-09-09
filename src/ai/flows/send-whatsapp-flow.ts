
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
    const fromNumber = process.env.TWILIO_SENDER_NUMBER || "+14155238886"; // Twilio's WhatsApp Sandbox number

    // =================================================================================
    // IMPORTANT: Replace these placeholder SIDs with your actual Content SIDs
    // from your Twilio Console. You can find these under Messaging > Senders >
    // WhatsApp Templates. Each template has a unique SID starting with "HX".
    // =================================================================================
    const templateSids: { [key: string]: string } = {
        'competition_entry_failure': 'HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 
        'competition_entry_success': 'HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        'competition_entry_leaderboard': 'HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    };
    // =================================================================================

    if (!accountSid || !authToken) {
      const error = "Twilio Account SID or Auth Token are not configured in environment variables.";
      console.error(error);
      return { success: false, error };
    }

    const contentSid = templateSids[input.template];
    if (!contentSid || contentSid.startsWith('HXxxxx')) {
        const error = `Template name "${input.template}" is not mapped to a valid SID or is still a placeholder. Check the mapping in send-whatsapp-flow.ts.`;
        console.error(error);
        return { success: false, error };
    }
    
    const payload = {
        contentSid: contentSid,
        from: `whatsapp:${fromNumber}`,
        to: `whatsapp:${input.to}`,
    };
    
    try {
      const client = new Twilio(accountSid, authToken);
      const message = await client.messages.create(payload);
      console.log('Twilio message sent successfully:', message.sid);
      return { success: true, messageId: message.sid };
    } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Failed to send Twilio message:', errorMessage, 'Payload:', payload);
        return { success: false, error: errorMessage };
    }
  }
);
