import { Request, Response } from 'express';
import { messageService } from '../services';
import { ApiResponse } from '../utils';

export class MessageController {
  async sendMessage(req: Request, res: Response) {
    const { sessionId } = req.params;
    const message = await messageService.sendMessage(sessionId, req.body);
    return ApiResponse.created(res, message, 'Message sent successfully');
  }

  async sendMedia(req: Request, res: Response) {
    const { sessionId } = req.params;
    const message = await messageService.sendMedia(sessionId, req.body);
    return ApiResponse.created(res, message, 'Media sent successfully');
  }

  async sendLocation(req: Request, res: Response) {
    const { sessionId } = req.params;
    const message = await messageService.sendLocation(sessionId, req.body);
    return ApiResponse.created(res, message, 'Location sent successfully');
  }

  async sendPoll(req: Request, res: Response) {
    const { sessionId } = req.params;
    const message = await messageService.sendPoll(sessionId, req.body);
    return ApiResponse.created(res, message, 'Poll sent successfully');
  }

  async react(req: Request, res: Response) {
    const { sessionId } = req.params;
    await messageService.reactToMessage(sessionId, req.body);
    return ApiResponse.success(res, null, 'Reaction sent successfully');
  }

  async forward(req: Request, res: Response) {
    const { sessionId } = req.params;
    const message = await messageService.forwardMessage(sessionId, req.body);
    return ApiResponse.success(res, message, 'Message forwarded successfully');
  }

  async delete(req: Request, res: Response) {
    const { sessionId } = req.params;
    await messageService.deleteMessage(sessionId, req.body);
    return ApiResponse.success(res, null, 'Message deleted successfully');
  }

  async edit(req: Request, res: Response) {
    const { sessionId } = req.params;
    const message = await messageService.editMessage(sessionId, req.body);
    return ApiResponse.success(res, message, 'Message edited successfully');
  }

  async fetchMessages(req: Request, res: Response) {
    const { sessionId, chatId } = req.params;
    const { limit } = req.query;
    const messages = await messageService.fetchMessages(sessionId, { chatId, limit: limit ? parseInt(limit as string) : 50 });
    return ApiResponse.success(res, messages);
  }

  async searchMessages(req: Request, res: Response) {
    const { sessionId } = req.params;
    const messages = await messageService.searchMessages(sessionId, req.body);
    return ApiResponse.success(res, messages);
  }

  async downloadMedia(req: Request, res: Response) {
    const { sessionId, chatId, messageId } = req.params;
    const media = await messageService.downloadMedia(sessionId, chatId, messageId);
    return ApiResponse.success(res, media);
  }
}

export const messageController = new MessageController();
