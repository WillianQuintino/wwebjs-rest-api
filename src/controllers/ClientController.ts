import { Request, Response } from 'express';
import { whatsAppClientService } from '../services';
import { ApiResponse } from '../utils';
import { Buffer } from 'buffer';
import qrcode from 'qrcode';
import qrTerminal from 'qrcode-terminal';
import { sessionRepository } from '../repositories';

export class ClientController {
  /**
   * @swagger
   * /api/v1/client/{sessionId}/init:
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
   *         description: Session initialized successfully with QR Code endpoints
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 sessionId:
   *                   type: string
   *                   description: The session ID
   *                 status:
   *                   type: string
   *                   description: Current session status
   *                 qrEndpoint:
   *                   type: string
   *                   description: Endpoint to get QR Code JSON data
   *                 qrImageUrl:
   *                   type: string
   *                   description: Direct URL to QR Code PNG image
   *                 sessionInfoUrl:
   *                   type: string
   *                   description: Endpoint to get complete session information
   *                 message:
   *                   type: string
   *                   description: Instructions for next steps
   */
  async initializeSession(req: Request, res: Response) {
    const { sessionId } = req.params;
    
    try {
      const session = await whatsAppClientService.initializeClient(sessionId);
      
      // Adiciona URLs úteis para o QR Code
      const baseUrl = `${req.protocol}://${req.get('host')}/api/v1/sessions/${sessionId}`;
      const responseData = {
        sessionId: session.sessionId,
        status: session.status,
        qrEndpoint: `${baseUrl}/qr`,
        qrImageUrl: `${baseUrl}/qr/image`,
        qrSvgUrl: `${baseUrl}/qr/svg`,
        qrAsciiUrl: `${baseUrl}/qr/ascii`,
        sessionInfoUrl: baseUrl,
        message: "QR Code will be available at these endpoints when status changes to 'QR_CODE'"
      };
      
      return ApiResponse.created(res, responseData, 'Session initialized successfully');
    } catch (error: unknown) {
      // Se a sessão já existe, inclui os links úteis na resposta de erro
      if (error && typeof error === 'object' && 'code' in error && error.code === 'CLIENT_ALREADY_EXISTS') {
        const apiError = error as { code: string; message: string };
        const baseUrl = `${req.protocol}://${req.get('host')}/api/v1/sessions/${sessionId}`;
        const errorResponse = {
          success: false,
          message: apiError.message,
          error: {
            code: apiError.code,
            message: apiError.message
          },
          links: {
            qrEndpoint: `${baseUrl}/qr`,
            qrImageUrl: `${baseUrl}/qr/image`,
            qrSvgUrl: `${baseUrl}/qr/svg`,
            qrAsciiUrl: `${baseUrl}/qr/ascii`,
            sessionInfoUrl: baseUrl,
            message: "Session already exists. Use these links to access QR Code in different formats"
          },
          timestamp: new Date().toISOString()
        };
        
        return res.status(400).json(errorResponse);
      }
      
      // Para outros erros, re-lança
      throw error;
    }
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
    
    // Adiciona URL do QR Code se disponível
    if (info.qrCode) {
      info.qrUrl = `${req.protocol}://${req.get('host')}/api/v1/sessions/${sessionId}/qr/image`;
    }
    
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
   * /api/v1/client/{sessionId}/qr:
   *   get:
   *     summary: Get QR Code for session authentication
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
   *         description: QR Code information
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 qrCode:
   *                   type: string
   *                   description: Base64 encoded QR code
   *                 qrUrl:
   *                   type: string
   *                   description: Direct URL to access QR code image
   *                 status:
   *                   type: string
   *                   description: Session status
   *       404:
   *         description: Session not found or QR code not available
   */
  async getQrCode(req: Request, res: Response) {
    const { sessionId } = req.params;
    const info = whatsAppClientService.getClientInfo(sessionId);
    
    if (!info.qrCode) {
      return ApiResponse.error(res, 'QR Code not available yet. Please wait a few seconds and try again.', 404);
    }

    const qrUrl = `${req.protocol}://${req.get('host')}/api/v1/sessions/${sessionId}/qr/image`;
    
    return ApiResponse.success(res, {
      qrCode: info.qrCode,
      qrUrl: qrUrl,
      status: info.status,
      sessionId: info.sessionId
    });
  }

  /**
   * @swagger
   * /api/v1/client/{sessionId}/qr/image:
   *   get:
   *     summary: Get QR Code as PNG image
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
   *         description: QR Code PNG image
   *         content:
   *           image/png:
   *             schema:
   *               type: string
   *               format: binary
   *       404:
   *         description: QR Code not found
   */
  async getQrCodeImage(req: Request, res: Response) {
    const { sessionId } = req.params;
    const info = whatsAppClientService.getClientInfo(sessionId);
    
    if (!info.qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR Code not available yet'
      });
    }

    // Extract base64 data from data URL
    const base64Data = info.qrCode.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', imageBuffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    return res.send(imageBuffer);
  }

  /**
   * @swagger
   * /api/v1/client/{sessionId}/qr/svg:
   *   get:
   *     summary: Get QR Code as scalable SVG
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
   *         description: QR Code SVG (scalable)
   *         content:
   *           image/svg+xml:
   *             schema:
   *               type: string
   *       404:
   *         description: QR Code not found
   */
  async getQrCodeSvg(req: Request, res: Response) {
    const { sessionId } = req.params;
    const session = whatsAppClientService.getClientInfo(sessionId);
    
    if (!session.qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR Code not available yet'
      });
    }

    try {
      // Extrai o texto original do QR Code da sessão
      const qrText = await this.getQrTextFromSession(sessionId);
      if (!qrText) {
        return res.status(404).json({
          success: false,
          message: 'QR Code data not available'
        });
      }

      // Gera SVG escalável
      const svgString = await qrcode.toString(qrText, {
        type: 'svg',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      return res.send(svgString);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error generating SVG QR Code'
      });
    }
  }

  /**
   * @swagger
   * /api/v1/client/{sessionId}/qr/ascii:
   *   get:
   *     summary: Get QR Code as ASCII art (text)
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
   *         description: QR Code as ASCII text
   *         content:
   *           text/plain:
   *             schema:
   *               type: string
   *       404:
   *         description: QR Code not found
   */
  async getQrCodeAscii(req: Request, res: Response) {
    const { sessionId } = req.params;
    const session = whatsAppClientService.getClientInfo(sessionId);
    
    if (!session.qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR Code not available yet'
      });
    }

    try {
      // Extrai o texto original do QR Code da sessão
      const qrText = await this.getQrTextFromSession(sessionId);
      if (!qrText) {
        return res.status(404).json({
          success: false,
          message: 'QR Code data not available'
        });
      }

      // Gera ASCII art
      const asciiQr = await new Promise<string>((resolve) => {
        qrTerminal.generate(qrText, { small: true }, (qrString: string) => {
          resolve(qrString);
        });
      });
      
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      return res.send(asciiQr);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error generating ASCII QR Code'
      });
    }
  }

  /**
   * Helper method to get original QR text from session
   */
  private async getQrTextFromSession(sessionId: string): Promise<string | null> {
    try {
      // Acessa a sessão completa através do repositório
      const session = sessionRepository.findById(sessionId);
      
      return session?.qrText || null;
    } catch (error) {
      return null;
    }
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
