// SMS Bridge Service for USSD integration
// This service handles communication with SMS gateways for feature phone users

interface SMSMessage {
  to: string;
  from: string;
  message: string;
  timestamp: Date;
}

interface USSDRequest {
  phone: string;
  sessionId: string;
  input: string;
  serviceCode: string;
}

interface USSDResponse {
  response: string;
  action: 'continue' | 'end';
}

class SMSBridgeService {
  private smsGatewayUrl: string;
  private apiKey: string;

  constructor() {
    this.smsGatewayUrl = process.env.REACT_APP_SMS_GATEWAY_URL || '';
    this.apiKey = process.env.REACT_APP_SMS_API_KEY || '';
  }

  // Send SMS message
  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.smsGatewayUrl}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          to: phoneNumber,
          message: message,
        }),
      });

      if (response.ok) {
        console.log(`SMS sent successfully to ${phoneNumber}`);
        return true;
      } else {
        console.error('Failed to send SMS:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  // Handle incoming SMS
  async handleIncomingSMS(message: SMSMessage): Promise<void> {
    console.log('Incoming SMS:', message);

    // Parse SMS content and route to appropriate handler
    const command = this.parseSMSCommand(message.message);

    switch (command.type) {
      case 'price_check':
        await this.handlePriceCheck(message.from, command.crop);
        break;
      case 'offer_create':
        await this.handleOfferCreate(message.from, command.data);
        break;
      case 'status_check':
        await this.handleStatusCheck(message.from);
        break;
      default:
        await this.sendSMS(message.from, 'Unknown command. Send HELP for available commands.');
    }
  }

  // Handle USSD requests
  async handleUSSDRequest(request: USSDRequest): Promise<USSDResponse> {
    console.log('USSD Request:', request);

    const { input, sessionId } = request;

    // USSD menu logic
    switch (input) {
      case '':
        // Initial menu
        return {
          response: 'Welcome to EATMS\n1. Check Prices\n2. Create Offer\n3. Check Status',
          action: 'continue',
        };

      case '1':
        return {
          response: 'Select crop:\n1. Teff\n2. Wheat\n3. Maize',
          action: 'continue',
        };

      case '11':
        return await this.getUSSDPriceResponse('Teff');

      case '12':
        return await this.getUSSDPriceResponse('Wheat');

      case '13':
        return await this.getUSSDPriceResponse('Maize');

      case '2':
        return {
          response: 'Enter crop details:\nFormat: CROP,QUANTITY,PRICE\nExample: Teff,100,2500',
          action: 'continue',
        };

      case '3':
        return await this.getUSSDStatusResponse(request.phone);

      default:
        // Handle custom input
        if (input.startsWith('2,')) {
          return await this.processOfferCreation(request.phone, input.substring(2));
        }

        return {
          response: 'Invalid option. Try again.',
          action: 'continue',
        };
    }
  }

  private parseSMSCommand(message: string): any {
    const lowerMessage = message.toLowerCase().trim();

    if (lowerMessage.startsWith('price')) {
      const crop = lowerMessage.replace('price', '').trim();
      return { type: 'price_check', crop };
    }

    if (lowerMessage.startsWith('offer')) {
      const data = lowerMessage.replace('offer', '').trim();
      return { type: 'offer_create', data };
    }

    if (lowerMessage === 'status') {
      return { type: 'status_check' };
    }

    return { type: 'unknown' };
  }

  private async handlePriceCheck(phoneNumber: string, crop: string): Promise<void> {
    try {
      // Fetch current price from API
      const response = await fetch(`/api/market-prices/?crop=${crop}`);
      const data = await response.json();

      if (data.length > 0) {
        const price = data[0];
        const message = `${crop} price: ${price.price} ETB/${price.unit} at ${price.market}`;
        await this.sendSMS(phoneNumber, message);
      } else {
        await this.sendSMS(phoneNumber, `No price data available for ${crop}`);
      }
    } catch (error) {
      console.error('Error fetching price:', error);
      await this.sendSMS(phoneNumber, 'Error fetching price data');
    }
  }

  private async handleOfferCreate(phoneNumber: string, data: string): Promise<void> {
    // Parse offer data and create offer
    await this.sendSMS(phoneNumber, 'Offer creation via SMS is not yet implemented');
  }

  private async handleStatusCheck(phoneNumber: string): Promise<void> {
    // Check user status
    await this.sendSMS(phoneNumber, 'Status check via SMS is not yet implemented');
  }

  private async getUSSDPriceResponse(crop: string): Promise<USSDResponse> {
    try {
      const response = await fetch(`/api/market-prices/?crop=${crop}&limit=1`);
      const data = await response.json();

      if (data.length > 0) {
        const price = data[0];
        return {
          response: `${crop}: ${price.price} ETB/${price.unit}\nMarket: ${price.market}\n0. Back to Main Menu`,
          action: 'continue',
        };
      } else {
        return {
          response: `No price data for ${crop}\n0. Back to Main Menu`,
          action: 'continue',
        };
      }
    } catch (error) {
      return {
        response: 'Error fetching price data\n0. Back to Main Menu',
        action: 'continue',
      };
    }
  }

  private async getUSSDStatusResponse(phoneNumber: string): Promise<USSDResponse> {
    // Mock status response
    return {
      response: 'Your offers: 2 active\nPayments: 1 pending\n0. Back to Main Menu',
      action: 'continue',
    };
  }

  private async processOfferCreation(phoneNumber: string, input: string): Promise<USSDResponse> {
    try {
      const [crop, quantity, price] = input.split(',');

      if (!crop || !quantity || !price) {
        return {
          response: 'Invalid format. Use: CROP,QUANTITY,PRICE\n0. Back to Main Menu',
          action: 'continue',
        };
      }

      // Create offer via API
      const offerData = {
        crop_name: crop.trim(),
        quantity: parseFloat(quantity),
        price_per_unit: parseFloat(price),
        farmer_phone: phoneNumber,
      };

      const response = await fetch('/api/offers/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(offerData),
      });

      if (response.ok) {
        return {
          response: 'Offer created successfully!\nYou will receive confirmation via SMS.\n0. Back to Main Menu',
          action: 'continue',
        };
      } else {
        return {
          response: 'Failed to create offer. Please try again.\n0. Back to Main Menu',
          action: 'continue',
        };
      }
    } catch (error) {
      return {
        response: 'Error creating offer. Please try again.\n0. Back to Main Menu',
        action: 'continue',
      };
    }
  }
}

export const smsBridgeService = new SMSBridgeService();
export default smsBridgeService;
