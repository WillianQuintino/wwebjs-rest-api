import { Request, Response } from 'express';
import { messageService } from '../services';
import { ApiResponse } from '../utils';

export class MessageController {
  /**
   * @swagger
   * /api/v1/messages/{sessionId}/send-message:
   *   post:
   *     summary: Send a text message
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
   *                 description: The chat ID (e.g., 1234567890@c.us)
   *               text: 
   *                 type: string
   *                 description: The text message
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
   * /api/v1/messages/{sessionId}/send-media:
   *   post:
   *     summary: Send a media message
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
   *                 description: The chat ID (e.g., 1234567890@c.us)
   *               media: 
   *                 type: string
   *                 description: Base64 encoded media or a URL to the media
   *               caption:
   *                 type: string
   *                 description: The media caption
   *             example:
   *               chatId: '5511999999999@c.us'
   *               media: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
   *               caption: 'My awesome picture'
   *     responses:
   *       201:
   *         description: Media sent successfully
   */
  async sendMedia(req: Request, res: Response) {
    const { sessionId } = req.params;
    const message = await messageService.sendMedia(sessionId, req.body);
    return ApiResponse.created(res, message, 'Media sent successfully');
  }

  /**
   * @swagger
   * /api/v1/messages/{sessionId}/send-location:
   *   post:
   *     summary: Send a location message
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
   *                 description: The chat ID (e.g., 1234567890@c.us)
   *               latitude: 
   *                 type: number
   *                 description: The latitude
   *               longitude:
   *                 type: number
   *                 description: The longitude
   *               description:
   *                 type: string
   *                 description: A description for the location
   *             example:
   *               chatId: '5511999999999@c.us'
   *               latitude: -23.550520
   *               longitude: -46.633308
   *               description: 'São Paulo'
   *     responses:
   *       201:
   *         description: Location sent successfully
   */
  async sendLocation(req: Request, res: Response) {
    const { sessionId } = req.params;
    const message = await messageService.sendLocation(sessionId, req.body);
    return ApiResponse.created(res, message, 'Location sent successfully');
  }

  /**
   * @swagger
   * /api/v1/messages/{sessionId}/send-poll:
   *   post:
   *     summary: Send a poll message
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
   *                 description: The chat ID (e.g., 1234567890@c.us)
   *               pollName: 
   *                 type: string
   *                 description: The name of the poll
   *               pollOptions:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: The poll options
   *             example:
   *               chatId: '5511999999999@c.us'
   *               pollName: 'What is your favorite color?'
   *               pollOptions: ['Red', 'Blue', 'Green']
   *     responses:
   *       201:
   *         description: Poll sent successfully
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
