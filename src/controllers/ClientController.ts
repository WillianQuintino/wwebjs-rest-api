import { Request, Response } from 'express';
import { whatsAppClientService } from '../services';
import { ApiResponse } from '../utils';

export class ClientController {
  /**
   * @swagger
   * /api/v1/client/{sessionId}/initialize:
   *   post:
   *     summary: Initialize a new WhatsApp client session
   *     tags: [Client]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *         required: true
   *         description: A unique ID for the session
   *     responses:
   *       201:
   *         description: Session initialized successfully. The response may include a QR code if the session is not yet authenticated.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 sessionId:
   *                   type: string
   *                 status:
   *                   type: string
   *                 qr:
   *                   type: string
   *                   description: QR code for authentication, if needed.
   */
  async initializeSession(req: Request, res: Response) {
    const { sessionId } = req.params;
    const session = await whatsAppClientService.initializeClient(sessionId);
    return ApiResponse.created(res, { sessionId: session.sessionId, status: session.status }, 'Session initialized successfully');
  }

  /**
   * @swagger
   * /api/v1/client/{sessionId}:
   *   get:
   *     summary: Get session information
   *     tags: [Client]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *         required: true
   *         description: The session ID
   *     responses:
   *       200:
   *         description: Session information
   */
  async getSession(req: Request, res: Response) {
    const { sessionId } = req.params;
    const info = whatsAppClientService.getClientInfo(sessionId);
    return ApiResponse.success(res, info);
  }

  /**
   * @swagger
   * /api/v1/client/sessions:
   *   get:
   *     summary: Get all active sessions
   *     tags: [Client]
   *     responses:
   *       200:
   *         description: A list of all active sessions
   */
  async getAllSessions(req: Request, res: Response) {
    const sessions = whatsAppClientService.getAllSessions();
    return ApiResponse.success(res, sessions);
  }

  /**
   * @swagger
   * /api/v1/client/{sessionId}/destroy:
   *   post:
   *     summary: Destroy a session and disconnect from WhatsApp
   *     tags: [Client]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *         required: true
   *         description: The session ID
   *     responses:
   *       200:
   *         description: Session destroyed successfully
   */
  async destroySession(req: Request, res: Response) {
    const { sessionId } = req.params;
    await whatsAppClientService.destroyClient(sessionId);
    return ApiResponse.success(res, null, 'Session destroyed successfully');
  }

  /**
   * @swagger
   * /api/v1/client/{sessionId}/logout:
   *   post:
   *     summary: Logout a session
   *     tags: [Client]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *         required: true
   *         description: The session ID
   *     responses:
   *       200:
   *         description: Logged out successfully
   */
  async logoutSession(req: Request, res: Response) {
    const { sessionId } = req.params;
    await whatsAppClientService.logoutClient(sessionId);
    return ApiResponse.success(res, null, 'Logged out successfully');
  }

  /**
   * @swagger
   * /api/v1/client/{sessionId}/state:
   *   get:
   *     summary: Get the connection state of a session
   *     tags: [Client]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *         required: true
   *         description: The session ID
   *     responses:
   *       200:
   *         description: The connection state
   */
  async getState(req: Request, res: Response) {
    const { sessionId } = req.params;
    const state = await whatsAppClientService.getState(sessionId);
    return ApiResponse.success(res, { state });
  }

  /**
   * @swagger
   * /api/v1/client/{sessionId}/battery:
   *   get:
   *     summary: Get the battery status of the connected device
   *     tags: [Client]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *         required: true
   *         description: The session ID
   *     responses:
   *       200:
   *         description: The battery status
   */
  async getBattery(req: Request, res: Response) {
    const { sessionId } = req.params;
    const battery = await whatsAppClientService.getBatteryStatus(sessionId);
    return ApiResponse.success(res, battery);
  }
}

export const clientController = new ClientController();
