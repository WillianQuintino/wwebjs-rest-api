import { Client } from 'whatsapp-web.js';

export interface IWhatsAppClient {
  sessionId: string;
  client: Client;
  isReady: boolean;
  qrCode?: string;
  status: ClientStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum ClientStatus {
  INITIALIZING = 'INITIALIZING',
  QR_CODE = 'QR_CODE',
  AUTHENTICATING = 'AUTHENTICATING',
  READY = 'READY',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR'
}

export interface IClientInfo {
  sessionId: string;
  status: ClientStatus;
  isReady: boolean;
  qrCode?: string;
  phoneNumber?: string;
  platform?: string;
  pushname?: string;
  batteryLevel?: number;
  isCharging?: boolean;
}
