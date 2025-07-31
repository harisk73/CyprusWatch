import twilio from 'twilio';

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSMS(to: string, message: string): Promise<void> {
  // Check if Twilio credentials are available
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.error('Twilio credentials missing:', {
      accountSid: !!process.env.TWILIO_ACCOUNT_SID,
      authToken: !!process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: !!process.env.TWILIO_PHONE_NUMBER
    });
    throw new Error('Twilio credentials not configured');
  }

  console.log(`Attempting to send SMS to ${to} from ${process.env.TWILIO_PHONE_NUMBER}`);
  console.log(`Message preview: ${message.substring(0, 50)}...`);

  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });

    console.log(`SMS sent successfully. SID: ${result.sid}, Status: ${result.status}`);
  } catch (error: any) {
    console.error('Twilio SMS error details:', {
      message: error.message,
      code: error.code,
      moreInfo: error.moreInfo,
      status: error.status,
      details: error.details
    });
    
    // Handle common Twilio errors with user-friendly messages
    let errorMessage = 'Failed to send SMS';
    if (error.code === 21211) {
      errorMessage = 'Invalid phone number format. Please include country code (e.g., +357...)';
    } else if (error.code === 21614) {
      errorMessage = 'Phone number is not valid or not reachable';
    } else if (error.code === 21608) {
      errorMessage = 'The phone number is not verified with Twilio (trial account limitation)';
    } else if (error.message) {
      errorMessage = `SMS delivery failed: ${error.message}`;
    }
    
    throw new Error(errorMessage);
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