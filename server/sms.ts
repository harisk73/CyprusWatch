import twilio from 'twilio';

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSMS(to: string, message: string): Promise<void> {
  // Check if Twilio credentials are available
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    throw new Error('Twilio credentials not configured');
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });

    console.log(`SMS sent successfully. SID: ${result.sid}`);
  } catch (error) {
    console.error('Twilio SMS error:', error);
    throw new Error(`Failed to send SMS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function sendEmergencyNotification(to: string, emergencyType: string, location: string): Promise<void> {
  const message = `🚨 CYPRUS EMERGENCY ALERT 🚨\n\nType: ${emergencyType.toUpperCase()}\nLocation: ${location}\n\nStay safe and follow official guidance.`;
  
  await sendSMS(to, message);
}

export async function sendVerificationCode(to: string, code: string): Promise<void> {
  const message = `Your Cyprus Emergency verification code: ${code}. Valid for 10 minutes. Do not share this code.`;
  
  await sendSMS(to, message);
}