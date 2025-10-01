import { Request, Response } from 'express';
import { whatsAppClientService } from '../services';
import { ApiResponse } from '../utils';

export class ClientController {
  async initializeSession(req: Request, res: Response) {
    const { sessionId } = req.params;
    const session = await whatsAppClientService.initializeClient(sessionId);
    return ApiResponse.created(res, { sessionId: session.sessionId, status: session.status }, 'Session initialized successfully');
  }

  async getSession(req: Request, res: Response) {
    const { sessionId } = req.params;
    const info = whatsAppClientService.getClientInfo(sessionId);
    return ApiResponse.success(res, info);
  }

  async getAllSessions(req: Request, res: Response) {
    const sessions = whatsAppClientService.getAllSessions();
    return ApiResponse.success(res, sessions);
  }

  async destroySession(req: Request, res: Response) {
    const { sessionId } = req.params;
    await whatsAppClientService.destroyClient(sessionId);
    return ApiResponse.success(res, null, 'Session destroyed successfully');
  }

  async logoutSession(req: Request, res: Response) {
    const { sessionId } = req.params;
    await whatsAppClientService.logoutClient(sessionId);
    return ApiResponse.success(res, null, 'Logged out successfully');
  }

  async getState(req: Request, res: Response) {
    const { sessionId } = req.params;
    const state = await whatsAppClientService.getState(sessionId);
    return ApiResponse.success(res, { state });
  }

  async getBattery(req: Request, res: Response) {
    const { sessionId } = req.params;
    const battery = await whatsAppClientService.getBatteryStatus(sessionId);
    return ApiResponse.success(res, battery);
  }
}

export const clientController = new ClientController();
