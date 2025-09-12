
import { NextResponse } from 'next/server';
import { Twilio } from 'twilio';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Map template identifiers to Twilio Content SIDs
const templateSidMap: Record<string, string> = {
  comp_success: 'HX...success_sid', // Replace with your actual success template SID
  comp_failure: 'HX0ec6a7dd8adf7f5b3de2058944dc4fff', // The one we've been testing
  comp_dethrone: 'HX...dethrone_sid', // Replace with your actual dethrone template SID
};


export async function POST(request: Request) {
  const { to, template } = await request.json();

  if (!to || !template) {
    return NextResponse.json({ success: false, error: 'Recipient phone number and template identifier are required.' }, { status: 400 });
  }

  const contentSid = templateSidMap[template];
  if (!contentSid) {
    return NextResponse.json({ success: false, error: `Invalid template identifier: ${template}` }, { status: 400 });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_SENDER_NUMBER || "+15558511306";
    
  const payload = {
      contentSid: contentSid,
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${to}`,
  };

  let logData: any = {
    to: to,
    template: `${template} (SID: ${contentSid})`,
    payload: payload,
    status: 'pending',
    timestamp: serverTimestamp(),
    error: null,
  };

  if (!accountSid || !authToken) {
    const errorMsg = "Twilio Account SID or Auth Token are not configured in environment variables.";
    console.error(errorMsg);
    logData.status = 'failure';
    logData.error = errorMsg;
    const logRef = await addDoc(collection(db, "whatsapp_logs"), logData);
    return NextResponse.json({ success: false, logId: logRef.id, error: errorMsg }, { status: 500 });
  }

  try {
    const client = new Twilio(accountSid, authToken, {logLevel: 'debug'});
    const tmp = await client.messages.create(payload);
    logData.messageInstance = `${tmp.sid}>>${tmp.apiVersion}>>${tmp.body}>>${tmp.status}>>${tmp.errorCode}>>${tmp.errorMessage}`;
    console.log("payload", payload, "tmp", tmp);
    
    logData.status = 'success';
    const logRef = await addDoc(collection(db, "whatsapp_logs"), logData);
    return NextResponse.json({ success: true, logId: logRef.id });

  } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to send Twilio message:', errorMessage, 'Payload:', payload);
      
      logData.status = 'failure';
      logData.error = errorMessage;
      const logRef = await addDoc(collection(db, "whatsapp_logs"), logData);
      return NextResponse.json({ success: false, logId: logRef.id, error: errorMessage }, { status: 500 });
  }
}
