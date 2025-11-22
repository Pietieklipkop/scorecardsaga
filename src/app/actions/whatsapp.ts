'use server';

import twilio from 'twilio';

type TemplateType = 'success' | 'failure' | 'leaderboard';

interface SendWhatsappMessageResult {
    success: boolean;
    error?: string;
    messageSid?: string;
}

export async function sendWhatsappMessage(
    to: string,
    templateType: TemplateType,
    variables?: Record<string, string>
): Promise<SendWhatsappMessageResult> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
        console.error('Missing Twilio credentials');
        return { success: false, error: 'Server configuration error' };
    }

    let contentSid = '';
    switch (templateType) {
        case 'success':
            contentSid = process.env.TWILIO_TEMPLATE_SID_ENTRY_SUCCESS || '';
            break;
        case 'failure':
            contentSid = process.env.TWILIO_TEMPLATE_SID_ENTRY_FAILURE || '';
            break;
        case 'leaderboard':
            contentSid = process.env.TWILIO_TEMPLATE_SID_LEADERBOARD || '';
            break;
    }

    if (!contentSid) {
        console.error(`Missing ContentSid for template type: ${templateType}`);
        return { success: false, error: 'Template configuration error' };
    }

    const client = twilio(accountSid, authToken);

    try {
        // Ensure phone number is in the correct format for Twilio (whatsapp:+E.164)
        // We assume 'to' is already E.164 (e.g. +2782...)
        const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

        const message = await client.messages.create({
            from: fromNumber,
            to: formattedTo,
            contentSid: contentSid,
            contentVariables: variables ? JSON.stringify(variables) : undefined,
        });

        return { success: true, messageSid: message.sid };
    } catch (error: any) {
        console.error('Error sending WhatsApp message:', error);
        return { success: false, error: error.message || 'Failed to send message' };
    }
}
