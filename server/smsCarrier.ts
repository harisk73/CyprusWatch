interface SMSCarrierConfig {
  apiToken: string;
  defaultSendname?: string;
}

interface SendSMSParams {
  to: string | string[];
  message: string;
  sendname?: string;
}

interface SMSCarrierResponse {
  status: 'success' | 'error';
  details?: {
    messageid: string;
    testmode: boolean;
  };
  message?: string;
}

interface CreditsResponse {
  status: 'success' | 'error';
  details?: number;
  message?: string;
}

class SMSCarrierService {
  private config: SMSCarrierConfig;
  private baseURL = 'https://www.smsservicecenter.nl/api/v2';

  constructor(config: SMSCarrierConfig) {
    this.config = config;
  }

  /**
   * Send SMS using SMS Carrier EU API
   */
  async sendSMS(params: SendSMSParams): Promise<SMSCarrierResponse> {
    try {
      const { to, message, sendname } = params;
      
      // Convert phone numbers to comma-separated string if array
      const numbers = Array.isArray(to) ? to.join(',') : to;

      const payload = {
        numbers,
        message,
        sendname: sendname || this.config.defaultSendname || undefined
      };

      const response = await fetch(`${this.baseURL}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.config.apiToken}`
        },
        body: JSON.stringify(payload)
      });

      const data: SMSCarrierResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(`SMS Carrier API error: ${data.message || 'Unknown error'}`);
      }

      return data;
    } catch (error) {
      console.error('SMS Carrier send error:', error);
      throw error;
    }
  }

  /**
   * Check available credits
   */
  async getCredits(): Promise<number> {
    try {
      const response = await fetch(`${this.baseURL}/credits`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.config.apiToken}`
        }
      });

      const data: CreditsResponse = await response.json();
      
      if (!response.ok || data.status === 'error') {
        throw new Error(`SMS Carrier API error: ${data.message || 'Unknown error'}`);
      }

      return data.details || 0;
    } catch (error) {
      console.error('SMS Carrier credits check error:', error);
      throw error;
    }
  }

  /**
   * Get current sendname
   */
  async getSendname(): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseURL}/sendname`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.config.apiToken}`
        }
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        return data.details;
      }
      
      return null;
    } catch (error) {
      console.error('SMS Carrier get sendname error:', error);
      return null;
    }
  }

  /**
   * Update default sendname
   */
  async setSendname(sendname: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/sendname`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.config.apiToken}`
        },
        body: JSON.stringify({ sendname })
      });

      const data = await response.json();
      return data.status === 'success';
    } catch (error) {
      console.error('SMS Carrier set sendname error:', error);
      return false;
    }
  }
}

// Configuration and service initialization
const smsCarrierConfig: SMSCarrierConfig = {
  apiToken: process.env.SMS_CARRIER_API_TOKEN || '',
  defaultSendname: process.env.SMS_CARRIER_SENDNAME || 'CyprusAlert'
};

// Check if SMS Carrier is properly configured
const isSMSCarrierConfigured = () => {
  return !!(process.env.SMS_CARRIER_API_TOKEN);
};

// Create service instance
const smsCarrierService = new SMSCarrierService(smsCarrierConfig);

// Helper function to send SMS (compatible with existing Twilio interface)
export const sendSMS = async (to: string, message: string, from?: string): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> => {
  if (!isSMSCarrierConfigured()) {
    console.error('SMS Carrier not configured. Please set SMS_CARRIER_API_TOKEN environment variable.');
    return {
      success: false,
      error: 'SMS service not configured'
    };
  }

  try {
    console.log(`Attempting to send SMS to ${to} via SMS Carrier EU`);
    
    const result = await smsCarrierService.sendSMS({
      to,
      message,
      sendname: from
    });

    if (result.status === 'success') {
      console.log(`SMS sent successfully. Message ID: ${result.details?.messageid}`);
      return {
        success: true,
        messageId: result.details?.messageid
      };
    } else {
      console.error('SMS send failed:', result.message);
      return {
        success: false,
        error: result.message || 'Failed to send SMS'
      };
    }
  } catch (error) {
    console.error('SMS send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Helper function to check SMS service status
export const checkSMSServiceStatus = async (): Promise<{
  configured: boolean;
  credits?: number;
  sendname?: string;
  error?: string;
}> => {
  if (!isSMSCarrierConfigured()) {
    return {
      configured: false,
      error: 'SMS_CARRIER_API_TOKEN not set'
    };
  }

  try {
    const [credits, sendname] = await Promise.all([
      smsCarrierService.getCredits().catch(() => null),
      smsCarrierService.getSendname().catch(() => null)
    ]);

    return {
      configured: true,
      credits: credits || undefined,
      sendname: sendname || undefined
    };
  } catch (error) {
    return {
      configured: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export { smsCarrierService, SMSCarrierService, isSMSCarrierConfigured };