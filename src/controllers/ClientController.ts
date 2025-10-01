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
   * /sessions/{sessionId}/init:
   *   post:
   *     summary: Initialize a new WhatsApp Web session
   *     description: |
   *       Initializes a new WhatsApp Web session. The QR Code is generated asynchronously after initialization.
   *       
   *       **Usage Flow:**
   *       1. Call this endpoint to initialize
   *       2. Wait a few seconds for QR Code generation
   *       3. Use the returned URLs to access QR Code in different formats
   *       4. Scan QR Code with WhatsApp mobile app
   *       5. Check session status until it becomes 'READY'
   *       
   *       **QR Code Formats Available:**
   *       - PNG: Traditional bitmap format
   *       - SVG: Scalable vector format (responsive)
   *       - ASCII: Text format for terminals
   *     tags: [🔐 Session Management]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *           example: "mycompany-bot"
   *         required: true
   *         description: Unique identifier for the session (alphanumeric, dashes allowed)
   *     responses:
   *       201:
   *         description: Session initialized successfully with all QR Code access URLs
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     sessionId:
   *                       type: string
   *                       example: "mycompany-bot"
   *                       description: The session identifier
   *                     status:
   *                       type: string
   *                       example: "INITIALIZING"
   *                       enum: [INITIALIZING, QR_CODE, AUTHENTICATING, READY, DISCONNECTED, ERROR]
   *                       description: Current session status
   *                     qrEndpoint:
   *                       type: string
   *                       example: "http://localhost:3000/api/v1/sessions/mycompany-bot/qr"
   *                       description: Endpoint to get QR Code as JSON with base64 data
   *                     qrImageUrl:
   *                       type: string
   *                       example: "http://localhost:3000/api/v1/sessions/mycompany-bot/qr/image"
   *                       description: Direct URL to QR Code PNG image (for <img> tags)
   *                     qrSvgUrl:
   *                       type: string
   *                       example: "http://localhost:3000/api/v1/sessions/mycompany-bot/qr/svg"
   *                       description: Direct URL to scalable SVG QR Code (responsive)
   *                     qrAsciiUrl:
   *                       type: string
   *                       example: "http://localhost:3000/api/v1/sessions/mycompany-bot/qr/ascii"
   *                       description: Direct URL to ASCII art QR Code (for terminals)
   *                     sessionInfoUrl:
   *                       type: string
   *                       example: "http://localhost:3000/api/v1/sessions/mycompany-bot"
   *                       description: Endpoint to get complete session information
   *                     message:
   *                       type: string
   *                       example: "QR Code will be available at these endpoints when status changes to 'QR_CODE'"
   *                       description: Instructions for next steps
   *                 message:
   *                   type: string
   *                   example: "Session initialized successfully"
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                   example: "2025-10-01T20:37:24.315Z"
   *       400:
   *         description: Session already exists (includes helpful links)
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "Session mycompany-bot already exists"
   *                 error:
   *                   type: object
   *                   properties:
   *                     code:
   *                       type: string
   *                       example: "CLIENT_ALREADY_EXISTS"
   *                     message:
   *                       type: string
   *                       example: "Session mycompany-bot already exists"
   *                 links:
   *                   type: object
   *                   description: Helpful links to access existing session
   *                   properties:
   *                     qrEndpoint:
   *                       type: string
   *                       example: "http://localhost:3000/api/v1/sessions/mycompany-bot/qr"
   *                     qrImageUrl:
   *                       type: string
   *                       example: "http://localhost:3000/api/v1/sessions/mycompany-bot/qr/image"
   *                     qrSvgUrl:
   *                       type: string
   *                       example: "http://localhost:3000/api/v1/sessions/mycompany-bot/qr/svg"
   *                     qrAsciiUrl:
   *                       type: string
   *                       example: "http://localhost:3000/api/v1/sessions/mycompany-bot/qr/ascii"
   *                     sessionInfoUrl:
   *                       type: string
   *                       example: "http://localhost:3000/api/v1/sessions/mycompany-bot"
   *                     message:
   *                       type: string
   *                       example: "Session already exists. Use these links to access QR Code in different formats"
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
   * /sessions/{sessionId}:
   *   get:
   *     summary: Get detailed session information and status
   *     description: |
   *       Retrieves comprehensive information about a WhatsApp Web session including:
   *       - Current status (INITIALIZING, QR_CODE, AUTHENTICATING, READY, etc.)
   *       - QR Code data (base64) when available
   *       - Direct QR Code image URL
   *       - Phone number and profile info (when authenticated)
   *       
   *       **When to use:**
   *       - Check if QR Code is ready after initialization
   *       - Monitor authentication progress
   *       - Get session status before sending messages
   *       - Retrieve phone number after successful authentication
   *       
   *       **Status Flow:**
   *       `INITIALIZING` → `QR_CODE` → `AUTHENTICATING` → `READY`
   *     tags: [🔐 Session Management]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *           example: "mycompany-bot"
   *         required: true
   *         description: The session identifier
   *     responses:
   *       200:
   *         description: Session information retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     sessionId:
   *                       type: string
   *                       example: "mycompany-bot"
   *                     status:
   *                       type: string
   *                       example: "QR_CODE"
   *                       enum: [INITIALIZING, QR_CODE, AUTHENTICATING, READY, DISCONNECTED, ERROR]
   *                       description: Current session status
   *                     isReady:
   *                       type: boolean
   *                       example: false
   *                       description: Whether session is ready to send/receive messages
   *                     qrCode:
   *                       type: string
   *                       example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA..."
   *                       description: Base64 encoded QR Code image (when status is QR_CODE)
   *                     qrUrl:
   *                       type: string
   *                       example: "http://localhost:3000/api/v1/sessions/mycompany-bot/qr/image"
   *                       description: Direct URL to QR Code PNG image
   *                     phoneNumber:
   *                       type: string
   *                       example: "5511999999999"
   *                       description: Phone number (available when authenticated)
   *                     platform:
   *                       type: string
   *                       example: "android"
   *                       description: Device platform (available when authenticated)
   *                     pushname:
   *                       type: string
   *                       example: "John Doe"
   *                       description: Display name (available when authenticated)
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                   example: "2025-10-01T20:37:24.315Z"
   *       404:
   *         description: Session not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "Client not found for session: mycompany-bot"
   *                 error:
   *                   type: object
   *                   properties:
   *                     code:
   *                       type: string
   *                       example: "CLIENT_NOT_FOUND"
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
   * /sessions:
   *   get:
   *     summary: List all active WhatsApp Web sessions
   *     description: |
   *       Retrieves a list of all currently active sessions with their basic information.
   *       
   *       **Useful for:**
   *       - Monitoring multiple sessions
   *       - Session management dashboards
   *       - Health checks across all sessions
   *       - Finding sessions by ID or status
   *       
   *       **Response includes:**
   *       - Session IDs
   *       - Current status of each session
   *       - Ready state for message sending
   *     tags: [🔐 Session Management]
   *     responses:
   *       200:
   *         description: List of all active sessions retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       sessionId:
   *                         type: string
   *                         example: "mycompany-bot"
   *                         description: Session identifier
   *                       status:
   *                         type: string
   *                         example: "READY"
   *                         enum: [INITIALIZING, QR_CODE, AUTHENTICATING, READY, DISCONNECTED, ERROR]
   *                         description: Current session status
   *                       isReady:
   *                         type: boolean
   *                         example: true
   *                         description: Whether session can send/receive messages
   *                   example:
   *                     - sessionId: "mycompany-bot"
   *                       status: "READY"
   *                       isReady: true
   *                     - sessionId: "support-bot"
   *                       status: "QR_CODE"
   *                       isReady: false
   *                     - sessionId: "sales-bot"
   *                       status: "DISCONNECTED"
   *                       isReady: false
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                   example: "2025-10-01T20:37:24.315Z"
   */
  async getAllSessions(req: Request, res: Response) {
    const sessions = whatsAppClientService.getAllSessions();
    return ApiResponse.success(res, sessions);
  }

  /**
   * @swagger
   * /sessions/{sessionId}:
   *   delete:
   *     summary: Destroy session and clean up all resources
   *     description: |
   *       Completely destroys a WhatsApp Web session, disconnecting from WhatsApp
   *       and cleaning up all associated resources.
   *       
   *       **⚠️ Warning: This action is irreversible!**
   *       
   *       **What happens:**
   *       - Disconnects from WhatsApp Web
   *       - Clears session data and authentication
   *       - Removes session from memory
   *       - Frees up resources
   *       - Forces re-authentication for next use
   *       
   *       **When to use:**
   *       - Shutting down bot permanently
   *       - Switching to different WhatsApp account
   *       - Clearing corrupted session data
   *       - Freeing memory in production
   *       
   *       **Alternative:** Use `/logout` if you want to disconnect without destroying
   *     tags: [🔐 Session Management]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *           example: "mycompany-bot"
   *         required: true
   *         description: The session identifier to destroy
   *     responses:
   *       200:
   *         description: Session destroyed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: null
   *                   example: null
   *                 message:
   *                   type: string
   *                   example: "Session destroyed successfully"
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       404:
   *         description: Session not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "Client not found for session: mycompany-bot"
   */
  async destroySession(req: Request, res: Response) {
    const { sessionId } = req.params;
    await whatsAppClientService.destroyClient(sessionId);
    return ApiResponse.success(res, null, 'Session destroyed successfully');
  }

  /**
   * @swagger
   * /sessions/{sessionId}/logout:
   *   post:
   *     summary: Logout from WhatsApp Web (graceful disconnect)
   *     description: |
   *       Gracefully logs out from WhatsApp Web while keeping the session object alive.
   *       This is a soft disconnect that allows for easy reconnection.
   *       
   *       **Difference from destroy:**
   *       - 🚪 **Logout**: Disconnect gracefully, session can be reused
   *       - 💥 **Destroy**: Complete cleanup, session must be recreated
   *       
   *       **What happens:**
   *       - Sends logout signal to WhatsApp Web
   *       - Changes session status to 'DISCONNECTED'
   *       - Keeps session object in memory
   *       - Maintains session configuration
   *       
   *       **When to use:**
   *       - Temporary disconnection
   *       - Switching between sessions
   *       - Maintenance mode
   *       - Controlled shutdown
   *       
   *       **Reconnection:**
   *       After logout, you can reinitialize the same session without destroying it.
   *     tags: [🔐 Session Management]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *           example: "mycompany-bot"
   *         required: true
   *         description: The session identifier to logout
   *     responses:
   *       200:
   *         description: Logged out successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: null
   *                   example: null
   *                 message:
   *                   type: string
   *                   example: "Logged out successfully"
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       404:
   *         description: Session not found or not ready
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "Client not found for session: mycompany-bot"
   */
  async logoutSession(req: Request, res: Response) {
    const { sessionId } = req.params;
    await whatsAppClientService.logoutClient(sessionId);
    return ApiResponse.success(res, null, 'Logged out successfully');
  }

  /**
   * @swagger
   * /sessions/{sessionId}/qr:
   *   get:
   *     summary: Get QR Code data as JSON with base64 and direct URLs
   *     description: |
   *       Returns QR Code data in JSON format including base64 encoded image and direct access URLs.
   *       
   *       **When to use:**
   *       - Need QR Code as base64 for embedding in applications
   *       - Want both data and access URLs in single request
   *       - Building custom QR Code display components
   *       
   *       **Prerequisites:**
   *       - Session must be initialized
   *       - Session status should be 'QR_CODE'
   *       - Wait a few seconds after initialization for QR generation
   *       
   *       **Integration examples:**
   *       - React: `<img src={data.qrCode} />`
   *       - HTML: Use `qrImageUrl` for direct image loading
   *       - Mobile: Convert base64 to image format
   *     tags: [📱 QR Code Access]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *           example: "mycompany-bot"
   *         required: true
   *         description: The session identifier
   *     responses:
   *       200:
   *         description: QR Code data retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     qrCode:
   *                       type: string
   *                       example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA..."
   *                       description: Base64 encoded PNG image (ready for <img> src)
   *                     qrUrl:
   *                       type: string
   *                       example: "http://localhost:3000/api/v1/sessions/mycompany-bot/qr/image"
   *                       description: Direct URL to PNG image
   *                     status:
   *                       type: string
   *                       example: "QR_CODE"
   *                       description: Current session status
   *                     sessionId:
   *                       type: string
   *                       example: "mycompany-bot"
   *                       description: Session identifier
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       404:
   *         description: Session not found or QR Code not available yet
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "QR Code not available yet. Please wait a few seconds and try again."
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
   * /sessions/{sessionId}/qr/image:
   *   get:
   *     summary: Get QR Code as PNG image (direct download/display)
   *     description: |
   *       Returns QR Code as a PNG image file that can be directly displayed in browsers,
   *       used in <img> tags, or downloaded.
   *       
   *       **Perfect for:**
   *       - Direct browser display: `window.open(url)`
   *       - HTML img tags: `<img src="this-url" />`
   *       - Download/save QR Code as image file
   *       - Embedding in documents or presentations
   *       - Mobile app image views
   *       
   *       **Characteristics:**
   *       - Format: PNG (bitmap)
   *       - Fixed size: Optimized for scanning
   *       - Cache headers: Disabled for real-time updates
   *       - Content-Type: image/png
   *       
   *       **Usage examples:**
   *       - Browser: Navigate directly to this URL
   *       - JavaScript: `fetch(url).then(r => r.blob())`
   *       - HTML: `<img src="url" alt="WhatsApp QR Code" />`
   *     tags: [📱 QR Code Access]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *           example: "mycompany-bot"
   *         required: true
   *         description: The session identifier
   *     responses:
   *       200:
   *         description: QR Code PNG image ready for display or download
   *         headers:
   *           Content-Type:
   *             schema:
   *               type: string
   *               example: "image/png"
   *             description: MIME type for PNG images
   *           Cache-Control:
   *             schema:
   *               type: string
   *               example: "no-cache, no-store, must-revalidate"
   *             description: Prevents caching for real-time QR updates
   *         content:
   *           image/png:
   *             schema:
   *               type: string
   *               format: binary
   *               description: PNG image binary data
   *       404:
   *         description: Session not found or QR Code not available yet
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "QR Code not available yet"
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
   * /sessions/{sessionId}/qr/svg:
   *   get:
   *     summary: Get QR Code as scalable SVG (vector format)
   *     description: |
   *       Returns QR Code as a Scalable Vector Graphics (SVG) file that can be resized
   *       to any dimension without quality loss.
   *       
   *       **Advantages of SVG:**
   *       - 📏 **Infinitely scalable** - No pixelation at any size
   *       - 📱 **Responsive design** - Perfect for mobile and desktop
   *       - 🎨 **CSS customizable** - Change colors, add effects
   *       - 📦 **Smaller file size** - Often smaller than PNG
   *       - 🖨️ **Print quality** - Vector graphics print perfectly
   *       
   *       **Perfect for:**
   *       - Responsive web applications
   *       - High-DPI (Retina) displays
   *       - Print materials and documents
   *       - Dynamic resizing with CSS
   *       - Professional presentations
   *       
   *       **CSS Styling Example:**
   *       ```css
   *       .qr-code {
   *         width: 200px;
   *         height: 200px;
   *         border: 2px solid #ccc;
   *         border-radius: 8px;
   *       }
   *       ```
   *       
   *       **HTML Usage:**
   *       ```html
   *       <img src="this-url" class="qr-code" alt="QR Code" />
   *       <!-- OR embed directly -->
   *       <object data="this-url" type="image/svg+xml"></object>
   *       ```
   *     tags: [📱 QR Code Access]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *           example: "mycompany-bot"
   *         required: true
   *         description: The session identifier
   *     responses:
   *       200:
   *         description: QR Code SVG vector graphic ready for scaling
   *         headers:
   *           Content-Type:
   *             schema:
   *               type: string
   *               example: "image/svg+xml"
   *             description: MIME type for SVG images
   *           Cache-Control:
   *             schema:
   *               type: string
   *               example: "no-cache, no-store, must-revalidate"
   *             description: Prevents caching for real-time QR updates
   *         content:
   *           image/svg+xml:
   *             schema:
   *               type: string
   *               example: |
   *                 <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
   *                   <rect width="300" height="300" fill="#FFFFFF"/>
   *                   <path d="M0,0h7v7h-7z" fill="#000000"/>
   *                   <!-- QR Code paths... -->
   *                 </svg>
   *               description: SVG markup for the QR Code
   *       404:
   *         description: Session not found or QR Code not available yet
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "QR Code not available yet"
   *       500:
   *         description: Error generating SVG QR Code
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "Error generating SVG QR Code"
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
   * /sessions/{sessionId}/qr/ascii:
   *   get:
   *     summary: Get QR Code as ASCII art (text format)
   *     description: |
   *       Returns QR Code as ASCII art using terminal-friendly characters.
   *       This text-based format is perfect for command-line tools and text environments.
   *       
   *       **Perfect for:**
   *       - 💻 **Terminal applications** - Display directly in CLI
   *       - 📋 **Log files** - Text-based logging systems
   *       - 📧 **Email/Text** - Send QR Code in plain text messages
   *       - 🔧 **Debugging** - Quick visual verification in development
   *       - 📰 **Documentation** - Include in text-based docs
   *       - 🤖 **Bot messages** - Send via text-only channels
   *       
   *       **Characteristics:**
   *       - Format: Plain text with Unicode block characters
   *       - Encoding: UTF-8 for proper character display
   *       - Style: Compact terminal-optimized output
   *       - Scannable: Works with most QR Code readers
   *       
   *       **Terminal Usage Examples:**
   *       ```bash
   *       # Display in terminal
   *       curl http://localhost:3000/api/v1/sessions/bot/qr/ascii
   *       
   *       # Save to file
   *       curl http://localhost:3000/api/v1/sessions/bot/qr/ascii > qr.txt
   *       
   *       # Use in scripts
   *       QR=$(curl -s http://localhost:3000/api/v1/sessions/bot/qr/ascii)
   *       echo "$QR" | mail -s "WhatsApp QR Code" user@example.com
   *       ```
   *       
   *       **Programming Examples:**
   *       ```javascript
   *       // Node.js
   *       const response = await fetch(url);
   *       const asciiQr = await response.text();
   *       console.log(asciiQr);
   *       
   *       // Python
   *       import requests
   *       response = requests.get(url)
   *       print(response.text)
   *       ```
   *     tags: [📱 QR Code Access]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *           example: "mycompany-bot"
   *         required: true
   *         description: The session identifier
   *     responses:
   *       200:
   *         description: QR Code as ASCII art text ready for terminal display
   *         headers:
   *           Content-Type:
   *             schema:
   *               type: string
   *               example: "text/plain; charset=utf-8"
   *             description: Plain text with UTF-8 encoding
   *           Cache-Control:
   *             schema:
   *               type: string
   *               example: "no-cache, no-store, must-revalidate"
   *             description: Prevents caching for real-time QR updates
   *         content:
   *           text/plain:
   *             schema:
   *               type: string
   *               example: |
   *                 ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
   *                 █ ▄▄▄▄▄ █▄ █▄▄▀▀█▀█▄ ▀█▄█▄▄▀█ ▄ ▄ █▀ █▄█ █▄▄▀  ▄ ██ ▄▄▄▄▄ █
   *                 █ █   █ █ ▀▀▄▄ ██▄ ▀▄▄▄█▀  ████▄ ██▀  ▄▀██▀▄ █▀▄ ██ █   █ █
   *                 █ █▄▄▄█ █▄  ▀▀█▀▀▀▄▀ ▀▄█ █▀ ▄▄▄ ▄█▄▀▀▀  █▄▀██▀▄▀▄██ █▄▄▄█ █
   *                 █▄▄▄▄▄▄▄█▄▀ █▄▀ █▄█▄▀▄█▄▀▄█ █▄█ ▀ ▀ █ █ ▀ ▀ ▀ █▄█ █▄▄▄▄▄▄▄█
   *                 [... more ASCII art lines ...]
   *               description: ASCII art representation of the QR Code
   *       404:
   *         description: Session not found or QR Code not available yet
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "QR Code not available yet"
   *       500:
   *         description: Error generating ASCII QR Code
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "Error generating ASCII QR Code"
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
   * /sessions/{sessionId}/state:
   *   get:
   *     summary: Get detailed WhatsApp Web connection state
   *     description: |
   *       Returns the current WhatsApp Web connection state with technical details.
   *       This provides low-level connection information beyond the basic session status.
   *       
   *       **Connection States:**
   *       - `CONFLICT` - Multiple sessions detected
   *       - `CONNECTED` - Successfully connected to WhatsApp Web
   *       - `DEPRECATED_VERSION` - WhatsApp Web version is outdated
   *       - `OPENING` - Establishing connection
   *       - `PAIRING` - Waiting for QR Code scan
   *       - `SMB_TOS_BLOCK` - Terms of service blocked
   *       - `TIMEOUT` - Connection timeout
   *       - `TOS_BLOCK` - Terms of service violation
   *       - `UNLAUNCHED` - Not yet launched
   *       - `UNPAIRED` - Not paired with mobile device
   *       - `UNPAIRED_IDLE` - Unpaired and idle
   *       
   *       **Use cases:**
   *       - Detailed connection debugging
   *       - Technical health monitoring
   *       - Connection state logging
   *       - Advanced session diagnostics
   *     tags: [🔍 Session Diagnostics]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *           example: "mycompany-bot"
   *         required: true
   *         description: The session identifier
   *     responses:
   *       200:
   *         description: Connection state retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     state:
   *                       type: string
   *                       example: "CONNECTED"
   *                       enum: [CONFLICT, CONNECTED, DEPRECATED_VERSION, OPENING, PAIRING, SMB_TOS_BLOCK, TIMEOUT, TOS_BLOCK, UNLAUNCHED, UNPAIRED, UNPAIRED_IDLE]
   *                       description: Current WhatsApp Web connection state
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       404:
   *         description: Session not found or not ready
   */
  async getState(req: Request, res: Response) {
    const { sessionId } = req.params;
    const state = await whatsAppClientService.getState(sessionId);
    return ApiResponse.success(res, { state });
  }

  /**
   * @swagger
   * /sessions/{sessionId}/battery:
   *   get:
   *     summary: Get mobile device battery status
   *     description: |
   *       Returns the battery status of the mobile device connected to this WhatsApp Web session.
   *       This information comes directly from the paired mobile device.
   *       
   *       **Information provided:**
   *       - Battery percentage level
   *       - Charging status (plugged in or on battery)
   *       - Real-time battery data from mobile device
   *       
   *       **Use cases:**
   *       - Monitor device health for critical bots
   *       - Send low battery alerts
   *       - Session health dashboards
   *       - Device maintenance scheduling
   *       - Power management for 24/7 operations
   *       
   *       **Requirements:**
   *       - Session must be authenticated (status: READY)
   *       - Mobile device must be connected to internet
   *       - WhatsApp must be running on mobile device
   *       
   *       **Example alert logic:**
   *       ```javascript
   *       if (battery.level < 20 && !battery.plugged) {
   *         sendAlert('Low battery warning: ' + battery.level + '%');
   *       }
   *       ```
   *     tags: [🔍 Session Diagnostics]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *           example: "mycompany-bot"
   *         required: true
   *         description: The session identifier
   *     responses:
   *       200:
   *         description: Battery status retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     level:
   *                       type: number
   *                       example: 85
   *                       minimum: 0
   *                       maximum: 100
   *                       description: Battery percentage (0-100)
   *                     plugged:
   *                       type: boolean
   *                       example: true
   *                       description: Whether device is charging/plugged in
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *       404:
   *         description: Session not found or not ready
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "Client not found for session: mycompany-bot"
   */
  async getBattery(req: Request, res: Response) {
    const { sessionId } = req.params;
    const battery = await whatsAppClientService.getBatteryStatus(sessionId);
    return ApiResponse.success(res, battery);
  }
}

export const clientController = new ClientController();
