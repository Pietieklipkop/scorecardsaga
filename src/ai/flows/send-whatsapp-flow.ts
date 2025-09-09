
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
  to: z.string(),
  template: z.string(),
  payload: z.any().optional(),
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

    // IMPORTANT: Replace the placeholder HXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    // with a real Content SID from your Twilio account.
    const templateSids: { [key: string]: string } = {
        'competition_entry_failure': 'HXe4b7f4b1f627b499ebe1c88895bd4c23', 
        'competition_entry_success': 'HX95d4ea576c704914bc271e6146533d7c',
        'competition_entry_leaderboard': 'HXe56af55a49b8080ca95ea93b6c5ce10',
    };
    
    const contentSid = templateSids[input.template];
    
    // The twilio-node library expects camelCase keys.
    const payload = {
        contentSid: contentSid,
        from: `whatsapp:${fromNumber}`,
        to: `whatsapp:${input.to}`,
        contentVariables: {},
    };

    if (!accountSid || !authToken) {
      const error = "Twilio Account SID or Auth Token are not configured in environment variables.";
      console.error(error);
      return { success: false, ...input, payload, error };
    }

    // Check if the template name is valid and mapped to a real SID.
    if (!contentSid || contentSid.startsWith('HXxxxx')) {
        const error = `Template name "${input.template}" is not mapped to a valid SID or is still a placeholder. Check the mapping in send-whatsapp-flow.ts.`;
        console.error(error);
        return { success: false, ...input, payload, error };
    }
    
    try {
      const client = new Twilio(accountSid, authToken);
      // The twilio-node library will correctly serialize the payload.
      await client.messages.create(payload);
      
      return { success: true, ...input, payload };

    } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Failed to send Twilio message:', errorMessage, 'Payload:', payload);
        return { success: false, ...input, payload, error: errorMessage };
    }
  }
);
