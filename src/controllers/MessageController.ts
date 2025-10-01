import { Request, Response } from 'express';
import { messageService } from '../services';
import { ApiResponse } from '../utils';

export class MessageController {
  /**
   * @swagger
   * /sessions/{sessionId}/messages/send:
   *   post:
   *     summary: Send text message to WhatsApp contact or group
   *     description: |
   *       Sends a text message to a specific WhatsApp contact or group.
   *       
   *       **Chat ID Formats:**
   *       - Individual: `5511999999999@c.us` (country + phone + @c.us)
   *       - Group: `120363123456789012@g.us` (group ID + @g.us)
   *       - Broadcast: `120363123456789012@broadcast`
   *       
   *       **Message Features:**
   *       - Plain text messages
   *       - Emojis and special characters
   *       - Mentions (@username)
   *       - Reply to specific messages
   *       - Message formatting (*bold*, _italic_, ~strikethrough~)
   *       
   *       **Requirements:**
   *       - Session must be authenticated (status: READY)
   *       - Chat ID must be valid WhatsApp format
   *       - Recipient must have WhatsApp account
   *       
   *       **Rate Limits:**
   *       WhatsApp enforces message rate limits. Avoid sending too many messages rapidly.
   *     tags: [💬 Messages]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *           example: "mycompany-bot"
   *         required: true
   *         description: The session identifier
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [chatId, content]
   *             properties:
   *               chatId: 
   *                 type: string
   *                 example: "5511999999999@c.us"
   *                 description: WhatsApp chat ID (individual or group)
   *                 pattern: '^[0-9]+@(c\.us|g\.us|broadcast)$'
   *               content: 
   *                 type: string
   *                 example: "Hello! This is a test message."
   *                 description: The text message content
   *                 maxLength: 4096
   *               options:
   *                 type: object
   *                 description: Optional message parameters
   *                 properties:
   *                   quotedMessageId:
   *                     type: string
   *                     example: "false_5511999999999@c.us_1234567890ABCDEF"
   *                     description: ID of message to reply to
   *                   mentions:
   *                     type: array
   *                     items:
   *                       type: string
   *                       example: "5511888888888@c.us"
   *                     description: List of contacts to mention
   *           examples:
   *             simple:
   *               summary: Simple text message
   *               value:
   *                 chatId: "5511999999999@c.us"
   *                 content: "Hello! How are you today?"
   *             with_mentions:
   *               summary: Message with mentions
   *               value:
   *                 chatId: "120363123456789012@g.us"
   *                 content: "Hello @John! Please check this out."
   *                 options:
   *                   mentions: ["5511888888888@c.us"]
   *             reply:
   *               summary: Reply to message
   *               value:
   *                 chatId: "5511999999999@c.us"
   *                 content: "Thanks for your message!"
   *                 options:
   *                   quotedMessageId: "false_5511999999999@c.us_1234567890ABCDEF"
   *             example:
   *               chatId: '5511999999999@c.us'
   *               text: 'Hello, world!'
   *     responses:
   *       201:
   *         description: Message sent successfully
   *       400:
   *         description: Bad request
   *       500:
   *         description: Internal server error
   */
  async sendMessage(req: Request, res: Response) {
    const { sessionId } = req.params;
    const message = await messageService.sendMessage(sessionId, req.body);
    return ApiResponse.created(res, message, 'Message sent successfully');
  }

  /**
   * @swagger
   * /sessions/{sessionId}/messages/send-media:
   *   post:
   *     summary: Send media message (image, video, audio, document)
   *     description: |
   *       Sends media files to WhatsApp contacts or groups with optional caption.
   *       
   *       **Supported Media Types:**
   *       - **Images**: JPG, PNG, GIF, WebP (max 16MB)
   *       - **Videos**: MP4, AVI, MOV, WebM (max 64MB)
   *       - **Audio**: MP3, OGG, AAC, WAV (max 16MB)
   *       - **Documents**: PDF, DOC, XLS, PPT, etc. (max 100MB)
   *       
   *       **Media Input Formats:**
   *       - Base64 encoded with data URL (data:image/png;base64,...)
   *       - HTTP/HTTPS URL (will be downloaded and sent)
   *       - Local file path (for server-side files)
   *       
   *       **Features:**
   *       - Optional captions for all media types
   *       - Automatic media type detection
   *       - File size validation
   *       - Preview generation for images/videos
   *       
   *       **Requirements:**
   *       - Session must be authenticated (status: READY)
   *       - Media must be accessible and valid format
   *       - Respect WhatsApp's file size limits
   *     tags: [💬 Messages]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *           example: "media-bot"
   *         required: true
   *         description: The session identifier
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [chatId, media]
   *             properties:
   *               chatId:
   *                 type: string
   *                 example: "5511999999999@c.us"
   *                 description: WhatsApp chat ID (individual or group)
   *                 pattern: '^[0-9]+@(c\.us|g\.us|broadcast)$'
   *               media: 
   *                 type: string
   *                 example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
   *                 description: Base64 encoded media, URL, or file path
   *               caption:
   *                 type: string
   *                 example: "Check out this awesome picture! 📸"
   *                 description: Optional caption for the media
   *                 maxLength: 1024
   *               filename:
   *                 type: string
   *                 example: "document.pdf"
   *                 description: Optional custom filename for documents
   *               options:
   *                 type: object
   *                 description: Additional media options
   *                 properties:
   *                   sendMediaAsSticker:
   *                     type: boolean
   *                     example: false
   *                     description: Send image as sticker (images only)
   *                   sendMediaAsDocument:
   *                     type: boolean
   *                     example: false
   *                     description: Send as document instead of preview
   *           examples:
   *             image_base64:
   *               summary: Base64 encoded image
   *               value:
   *                 chatId: "5511999999999@c.us"
   *                 media: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
   *                 caption: "Beautiful sunset! 🌅"
   *             image_url:
   *               summary: Image from URL
   *               value:
   *                 chatId: "120363123456789012@g.us"
   *                 media: "https://example.com/images/photo.jpg"
   *                 caption: "Shared from our website"
   *             document:
   *               summary: PDF document
   *               value:
   *                 chatId: "5511999999999@c.us"
   *                 media: "data:application/pdf;base64,JVBERi0xLjQK..."
   *                 filename: "report.pdf"
   *                 caption: "Monthly report attached"
   *             video:
   *               summary: Video file
   *               value:
   *                 chatId: "5511999999999@c.us"
   *                 media: "https://example.com/videos/demo.mp4"
   *                 caption: "Product demonstration video"
   *     responses:
   *       201:
   *         description: Media sent successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         messageId:
   *                           type: string
   *                           example: "false_5511999999999@c.us_1234567890ABCDEF"
   *                         mediaType:
   *                           type: string
   *                           example: "image"
   *                         mediaSize:
   *                           type: number
   *                           example: 1024576
   *                         timestamp:
   *                           type: number
   *                           example: 1635724800
   *       400:
   *         description: Invalid media format or size limit exceeded
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             examples:
   *               invalid_format:
   *                 summary: Unsupported media format
   *                 value:
   *                   success: false
   *                   message: "Unsupported media format. Please use JPG, PNG, MP4, PDF, etc."
   *               size_limit:
   *                 summary: File size too large
   *                 value:
   *                   success: false
   *                   message: "File size exceeds limit. Images max 16MB, Videos max 64MB."
   *       401:
   *         description: Session not authenticated
   *       404:
   *         description: Chat not found
   *       500:
   *         description: Internal server error
   */
  async sendMedia(req: Request, res: Response) {
    const { sessionId } = req.params;
    const message = await messageService.sendMedia(sessionId, req.body);
    return ApiResponse.created(res, message, 'Media sent successfully');
  }

  /**
   * @swagger
   * /sessions/{sessionId}/messages/send-location:
   *   post:
   *     summary: Send location coordinates with optional description
   *     description: |
   *       Sends a location message with GPS coordinates to WhatsApp contacts or groups.
   *       
   *       **Location Features:**
   *       - GPS coordinates (latitude/longitude)
   *       - Optional location name/description
   *       - Interactive map preview in WhatsApp
   *       - Clickable to open in maps application
   *       
   *       **Coordinate Formats:**
   *       - Decimal degrees (recommended): -23.550520, -46.633308
   *       - Range: Latitude [-90, 90], Longitude [-180, 180]
   *       
   *       **Use Cases:**
   *       - Share business location
   *       - Send meeting points
   *       - Share event venues
   *       - Emergency location sharing
   *       
   *       **Requirements:**
   *       - Session must be authenticated (status: READY)
   *       - Valid latitude/longitude coordinates
   *       - GPS coordinates must be within valid ranges
   *     tags: [💬 Messages]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *           example: "location-bot"
   *         required: true
   *         description: The session identifier
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [chatId, latitude, longitude]
   *             properties:
   *               chatId:
   *                 type: string
   *                 example: "5511999999999@c.us"
   *                 description: WhatsApp chat ID (individual or group)
   *                 pattern: '^[0-9]+@(c\.us|g\.us|broadcast)$'
   *               latitude: 
   *                 type: number
   *                 example: -23.550520
   *                 description: GPS latitude coordinate (-90 to 90)
   *                 minimum: -90
   *                 maximum: 90
   *               longitude:
   *                 type: number
   *                 example: -46.633308
   *                 description: GPS longitude coordinate (-180 to 180)
   *                 minimum: -180
   *                 maximum: 180
   *               description:
   *                 type: string
   *                 example: "São Paulo Downtown - Our Office"
   *                 description: Optional location name or description
   *                 maxLength: 256
   *           examples:
   *             office_location:
   *               summary: Office location
   *               value:
   *                 chatId: "5511999999999@c.us"
   *                 latitude: -23.550520
   *                 longitude: -46.633308
   *                 description: "TechCorp Office - 15th Floor"
   *             tourist_spot:
   *               summary: Tourist attraction
   *               value:
   *                 chatId: "120363123456789012@g.us"
   *                 latitude: -22.951916
   *                 longitude: -43.210487
   *                 description: "Christ the Redeemer - Rio de Janeiro"
   *             without_description:
   *               summary: Coordinates only
   *               value:
   *                 chatId: "5511999999999@c.us"
   *                 latitude: -23.550520
   *                 longitude: -46.633308
   *     responses:
   *       201:
   *         description: Location sent successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         messageId:
   *                           type: string
   *                           example: "false_5511999999999@c.us_1234567890ABCDEF"
   *                         coordinates:
   *                           type: object
   *                           properties:
   *                             latitude:
   *                               type: number
   *                               example: -23.550520
   *                             longitude:
   *                               type: number
   *                               example: -46.633308
   *                         description:
   *                           type: string
   *                           example: "São Paulo Downtown"
   *                         timestamp:
   *                           type: number
   *                           example: 1635724800
   *       400:
   *         description: Invalid coordinates or parameters
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             examples:
   *               invalid_coordinates:
   *                 summary: Invalid GPS coordinates
   *                 value:
   *                   success: false
   *                   message: "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180."
   *       401:
   *         description: Session not authenticated
   *       404:
   *         description: Chat not found
   *       500:
   *         description: Internal server error
   */
  async sendLocation(req: Request, res: Response) {
    const { sessionId } = req.params;
    const message = await messageService.sendLocation(sessionId, req.body);
    return ApiResponse.created(res, message, 'Location sent successfully');
  }

  /**
   * @swagger
   * /sessions/{sessionId}/messages/send-poll:
   *   post:
   *     summary: Send interactive poll with multiple choice options
   *     description: |
   *       Creates and sends an interactive poll to WhatsApp contacts or groups.
   *       
   *       **Poll Features:**
   *       - Multiple choice options (2-12 options)
   *       - Real-time vote counting
   *       - Anonymous or public voting
   *       - Poll results visible to all participants
   *       
   *       **Poll Types:**
   *       - **Single choice**: Users can select only one option
   *       - **Multiple choice**: Users can select multiple options (if supported)
   *       
   *       **Best Practices:**
   *       - Keep poll question clear and concise
   *       - Limit options to 2-8 for better UX
   *       - Use emojis to make options more engaging
   *       - Consider cultural context for global audiences
   *       
   *       **Requirements:**
   *       - Session must be authenticated (status: READY)
   *       - Minimum 2 options, maximum 12 options
   *       - Poll question is required
   *       - Works in groups and individual chats
   *     tags: [💬 Messages]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *           example: "poll-bot"
   *         required: true
   *         description: The session identifier
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [chatId, pollName, pollOptions]
   *             properties:
   *               chatId:
   *                 type: string
   *                 example: "120363123456789012@g.us"
   *                 description: WhatsApp chat ID (works better in groups)
   *                 pattern: '^[0-9]+@(c\.us|g\.us|broadcast)$'
   *               pollName: 
   *                 type: string
   *                 example: "What's your favorite programming language? 💻"
   *                 description: The poll question or title
   *                 maxLength: 255
   *                 minLength: 1
   *               pollOptions:
   *                 type: array
   *                 items:
   *                   type: string
   *                   maxLength: 100
   *                 minItems: 2
   *                 maxItems: 12
   *                 example: ["🐍 Python", "☕ Java", "🟨 JavaScript", "💎 Ruby", "🦀 Rust", "⚡ Go"]
   *                 description: Array of poll options (2-12 items)
   *               options:
   *                 type: object
   *                 description: Additional poll configuration
   *                 properties:
   *                   allowMultipleAnswers:
   *                     type: boolean
   *                     example: false
   *                     description: Allow multiple selections (if supported)
   *                   messageSecret:
   *                     type: array
   *                     items:
   *                       type: number
   *                     description: Internal WhatsApp poll configuration
   *           examples:
   *             simple_poll:
   *               summary: Simple yes/no poll
   *               value:
   *                 chatId: "120363123456789012@g.us"
   *                 pollName: "Should we have the meeting tomorrow? 📅"
   *                 pollOptions: ["✅ Yes, let's do it", "❌ No, reschedule"]
   *             multiple_choice:
   *               summary: Multiple choice poll with emojis
   *               value:
   *                 chatId: "120363123456789012@g.us"
   *                 pollName: "Which features should we prioritize? 🚀"
   *                 pollOptions: ["🔐 Security", "⚡ Performance", "🎨 UI/UX", "📱 Mobile App", "🔔 Notifications", "📊 Analytics"]
   *             event_planning:
   *               summary: Event planning poll
   *               value:
   *                 chatId: "120363123456789012@g.us"
   *                 pollName: "Best day for team building? 🎉"
   *                 pollOptions: ["Monday 📅", "Tuesday 📅", "Wednesday 📅", "Thursday 📅", "Friday 📅"]
   *     responses:
   *       201:
   *         description: Poll sent successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         messageId:
   *                           type: string
   *                           example: "false_120363123456789012@g.us_1234567890ABCDEF"
   *                         pollId:
   *                           type: string
   *                           example: "poll_12345"
   *                         pollName:
   *                           type: string
   *                           example: "What's your favorite programming language?"
   *                         optionsCount:
   *                           type: number
   *                           example: 6
   *                         timestamp:
   *                           type: number
   *                           example: 1635724800
   *       400:
   *         description: Invalid poll parameters
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             examples:
   *               invalid_options:
   *                 summary: Invalid number of options
   *                 value:
   *                   success: false
   *                   message: "Poll must have between 2 and 12 options."
   *               empty_question:
   *                 summary: Empty poll question
   *                 value:
   *                   success: false
   *                   message: "Poll question cannot be empty."
   *       401:
   *         description: Session not authenticated
   *       404:
   *         description: Chat not found
   *       500:
   *         description: Internal server error
   */
  async sendPoll(req: Request, res: Response) {
    const { sessionId } = req.params;
    const message = await messageService.sendPoll(sessionId, req.body);
    return ApiResponse.created(res, message, 'Poll sent successfully');
  }

  /**
   * @swagger
   * /api/v1/messages/{sessionId}/react:
   *   post:
   *     summary: React to a message
   *     tags: [Messages]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *         required: true
   *         description: The session ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               messageId:
   *                 type: string
   *                 description: The ID of the message to react to
   *               reaction: 
   *                 type: string
   *                 description: The emoji to react with
   *             example:
   *               messageId: 'true_5511999999999@c.us_3EB0...'
   *               reaction: '👍'
   *     responses:
   *       200:
   *         description: Reaction sent successfully
   */
  async react(req: Request, res: Response) {
    const { sessionId } = req.params;
    await messageService.reactToMessage(sessionId, req.body);
    return ApiResponse.success(res, null, 'Reaction sent successfully');
  }

  /**
   * @swagger
   * /api/v1/messages/{sessionId}/forward:
   *   post:
   *     summary: Forward a message
   *     tags: [Messages]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *         required: true
   *         description: The session ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               chatId:
   *                 type: string
   *                 description: The chat ID to forward the message to
   *               messageId: 
   *                 type: string
   *                 description: The ID of the message to forward
   *             example:
   *               chatId: '5511988888888@c.us'
   *               messageId: 'true_5511999999999@c.us_3EB0...'
   *     responses:
   *       200:
   *         description: Message forwarded successfully
   */
  async forward(req: Request, res: Response) {
    const { sessionId } = req.params;
    const message = await messageService.forwardMessage(sessionId, req.body);
    return ApiResponse.success(res, message, 'Message forwarded successfully');
  }

  /**
   * @swagger
   * /api/v1/messages/{sessionId}/delete:
   *   post:
   *     summary: Delete a message
   *     tags: [Messages]
   *     description: This endpoint deletes a message. Use the `forEveryone` property to delete for everyone in the chat.
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *         required: true
   *         description: The session ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               messageId: 
   *                 type: string
   *                 description: The ID of the message to delete
   *               forEveryone:
   *                 type: boolean
   *                 description: Whether to delete the message for everyone
   *             example:
   *               messageId: 'true_5511999999999@c.us_3EB0...'
   *               forEveryone: true
   *     responses:
   *       200:
   *         description: Message deleted successfully
   */
  async delete(req: Request, res: Response) {
    const { sessionId } = req.params;
    await messageService.deleteMessage(sessionId, req.body);
    return ApiResponse.success(res, null, 'Message deleted successfully');
  }

  /**
   * @swagger
   * /api/v1/messages/{sessionId}/edit:
   *   post:
   *     summary: Edit a message
   *     tags: [Messages]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *         required: true
   *         description: The session ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               messageId: 
   *                 type: string
   *                 description: The ID of the message to edit
   *               newText:
   *                 type: string
   *                 description: The new text for the message
   *             example:
   *               messageId: 'true_5511999999999@c.us_3EB0...'
   *               newText: 'This is the edited message.'
   *     responses:
   *       200:
   *         description: Message edited successfully
   */
  async edit(req: Request, res: Response) {
    const { sessionId } = req.params;
    const message = await messageService.editMessage(sessionId, req.body);
    return ApiResponse.success(res, message, 'Message edited successfully');
  }

  /**
   * @swagger
   * /api/v1/messages/{sessionId}/{chatId}:
   *   get:
   *     summary: Fetch messages from a chat
   *     tags: [Messages]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *         required: true
   *         description: The session ID
   *       - in: path
   *         name: chatId
   *         schema:
   *           type: string
   *         required: true
   *         description: The chat ID
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: The maximum number of messages to fetch
   *     responses:
   *       200:
   *         description: A list of messages
   */
  async fetchMessages(req: Request, res: Response) {
    const { sessionId, chatId } = req.params;
    const { limit } = req.query;
    const messages = await messageService.fetchMessages(sessionId, { chatId, limit: limit ? parseInt(limit as string) : 50 });
    return ApiResponse.success(res, messages);
  }

  /**
   * @swagger
   * /api/v1/messages/{sessionId}/search:
   *   post:
   *     summary: Search for messages
   *     tags: [Messages]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *         required: true
   *         description: The session ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               query:
   *                 type: string
   *                 description: The text to search for
   *               chatId:
   *                 type: string
   *                 description: Optional chat ID to limit the search
   *             example:
   *               query: 'important'
   *               chatId: '5511999999999@c.us'
   *     responses:
   *       200:
   *         description: A list of found messages
   */
  async searchMessages(req: Request, res: Response) {
    const { sessionId } = req.params;
    const messages = await messageService.searchMessages(sessionId, req.body);
    return ApiResponse.success(res, messages);
  }

  /**
   * @swagger
   * /api/v1/messages/{sessionId}/{chatId}/{messageId}/download-media:
   *   get:
   *     summary: Download media from a message
   *     tags: [Messages]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *         required: true
   *         description: The session ID
   *       - in: path
   *         name: chatId
   *         schema:
   *           type: string
   *         required: true
   *         description: The chat ID
   *       - in: path
   *         name: messageId
   *         schema:
   *           type: string
   *         required: true
   *         description: The message ID containing the media
   *     responses:
   *       200:
   *         description: Base64 encoded media data
   */
  async downloadMedia(req: Request, res: Response) {
    const { sessionId, chatId, messageId } = req.params;
    const media = await messageService.downloadMedia(sessionId, chatId, messageId);
    return ApiResponse.success(res, media);
  }
}

export const messageController = new MessageController();
