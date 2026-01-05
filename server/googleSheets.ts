// Google Sheets Integration for AFTR ticket purchases
import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-sheet',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Sheet not connected');
  }
  return accessToken;
}

async function getGoogleSheetClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.sheets({ version: 'v4', auth: oauth2Client });
}

export interface TicketPurchaseData {
  timestamp: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  ticketType: string;
  price: string;
  paymentMethod: string;
  deliveryMethod: string;
  referenceCode: string;
  qrCode: string;
  eventId: string;
  status: string;
}

export async function appendTicketToSheet(data: TicketPurchaseData): Promise<boolean> {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  
  if (!spreadsheetId) {
    console.log('Google Sheet ID not configured, skipping sheet append');
    return false;
  }

  try {
    const sheets = await getGoogleSheetClient();
    
    const row = [
      data.timestamp,
      data.customerName,
      data.customerEmail || '',
      data.customerPhone,
      data.ticketType,
      data.price,
      data.paymentMethod,
      data.deliveryMethod,
      data.referenceCode,
      data.qrCode,
      data.eventId,
      data.status
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:L',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row]
      }
    });

    console.log('Successfully appended ticket to Google Sheet:', data.referenceCode);
    return true;
  } catch (error) {
    console.error('Failed to append to Google Sheet:', error);
    return false;
  }
}

export async function initializeSheetHeaders(): Promise<boolean> {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  
  if (!spreadsheetId) {
    return false;
  }

  try {
    const sheets = await getGoogleSheetClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A1:L1'
    });

    if (!response.data.values || response.data.values.length === 0) {
      const headers = [
        'Timestamp',
        'Customer Name',
        'Email',
        'Phone',
        'Ticket Type',
        'Price',
        'Payment Method',
        'Delivery Method',
        'Reference Code',
        'QR Code',
        'Event ID',
        'Status'
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sheet1!A1:L1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [headers]
        }
      });

      console.log('Initialized Google Sheet headers');
    }

    return true;
  } catch (error) {
    console.error('Failed to initialize sheet headers:', error);
    return false;
  }
}
