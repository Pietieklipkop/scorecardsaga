
import { NextResponse } from 'next/server';
import { Twilio } from 'twilio';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(request: Request) {
  const { to } = await request.json();

  if (!to) {
    return NextResponse.json({ success: false, error: 'Recipient phone number is required.' }, { status: 400 });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_SENDER_NUMBER || "+15558511306";
  
  // HARDCODED SID FOR DEBUGGING
  const contentSid = 'HX0ec6a7dd8adf7f5b3de2058944dc4fff';
    
  const payload = {
      contentSid: contentSid,
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${to}`,
  };

  let logData: any = {
    to: to,
    template: `SID: ${contentSid}`,
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
    const client = new Twilio(accountSid, authToken);
    await client.messages.create(payload);
    
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
