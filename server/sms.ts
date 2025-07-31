import fetch from 'node-fetch';

// SMS Carrier EU API configuration
const SMS_CARRIER_API_URL = 'https://api.i-digital-m.com/v2/sms';
const SMS_CARRIER_USERNAME = process.env.SMS_CARRIER_USERNAME;
const SMS_CARRIER_PASSWORD = process.env.SMS_CARRIER_PASSWORD;
const SMS_CARRIER_SENDER = process.env.SMS_CARRIER_SENDER;

export async function sendSMS(to: string, message: string): Promise<void> {
  // Check if SMS Carrier credentials are available
  if (!SMS_CARRIER_USERNAME || !SMS_CARRIER_PASSWORD || !SMS_CARRIER_SENDER) {
    console.error('SMS Carrier credentials missing:', {
      username: !!SMS_CARRIER_USERNAME,
      password: !!SMS_CARRIER_PASSWORD,
      sender: !!SMS_CARRIER_SENDER
    });
    
    // In development mode, log the message instead of failing
    if (process.env.NODE_ENV === 'development') {
      console.log(`Development SMS to ${to}: ${message}`);
      return;
    }
    
    throw new Error('SMS Carrier credentials not configured');
  }

  console.log(`Attempting to send SMS via SMS Carrier EU to ${to} from ${SMS_CARRIER_SENDER}`);
  console.log(`Message preview: ${message.substring(0, 50)}...`);

  try {
    // Create Basic Auth header
    const credentials = Buffer.from(`${SMS_CARRIER_USERNAME}:${SMS_CARRIER_PASSWORD}`).toString('base64');
    
    const response = await fetch(SMS_CARRIER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        sender: SMS_CARRIER_SENDER,
        recipient: to,
        message: message,
        dlr: 1 // Request delivery reports
      })
    });

    const result = await response.json() as any;
    
    if (result.status === 0 && result.messageId) {
      console.log(`SMS sent successfully via SMS Carrier EU. MessageID: ${result.messageId}`);
    } else {
      console.error('SMS Carrier error response:', result);
      throw new Error(result.errors?.[0]?.message || 'Failed to send SMS via SMS Carrier EU');
    }
  } catch (error: any) {
    console.error('SMS Carrier error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    // Handle common SMS errors with user-friendly messages
    let errorMessage = 'Failed to send SMS';
    if (error.message?.includes('Invalid phone number')) {
      errorMessage = 'Invalid phone number format. Please include country code (e.g., +357...)';
    } else if (error.message?.includes('insufficient balance')) {
      errorMessage = 'SMS service account has insufficient balance';
    } else if (error.message?.includes('unauthorized')) {
      errorMessage = 'SMS service authentication failed';
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