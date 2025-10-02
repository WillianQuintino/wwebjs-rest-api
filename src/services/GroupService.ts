import { whatsAppClientService } from './WhatsAppClientService';
import { Validators, Formatters, ApiError } from '../utils';
import { logger } from '../config';
import { ICreateGroupDTO, IAddParticipantsDTO, IRemoveParticipantsDTO, IPromoteParticipantsDTO, IDemoteParticipantsDTO, IUpdateGroupSubjectDTO, IUpdateGroupDescriptionDTO, IUpdateGroupPictureDTO, ISetMessagesAdminsOnlyDTO, IGroupChatResponse } from '../models';
import { MessageMedia } from 'whatsapp-web.js';

export class GroupService {
  async createGroup(sessionId: string, data: ICreateGroupDTO): Promise<IGroupChatResponse> {
    Validators.validateParticipantIds(data.participantIds);
    const client = whatsAppClientService.getClient(sessionId);
    const group = await client.createGroup(data.name, data.participantIds);
    logger.info(`Group ${data.name} created`);
    
    // Se createGroup retornar string (ID do grupo), busque o chat pelo ID
    if (typeof group === 'string') {
      const groupChat = await client.getChatById(group);
      return Formatters.formatGroupChat(groupChat as any);
    }
    
    return Formatters.formatGroupChat(group as any);
  }

  async addParticipants(sessionId: string, data: IAddParticipantsDTO): Promise<void> {
    Validators.validateChatId(data.groupId);
    Validators.validateParticipantIds(data.participantIds);
    const client = whatsAppClientService.getClient(sessionId);
    const chat = await client.getChatById(data.groupId);
    if (!chat.isGroup) throw ApiError.badRequest('Chat is not a group', 'NOT_A_GROUP' as any);
    await (chat as any).addParticipants(data.participantIds);
    logger.info(`Participants added to group ${data.groupId}`);
  }

  async removeParticipants(sessionId: string, data: IRemoveParticipantsDTO): Promise<void> {
    Validators.validateChatId(data.groupId);
    Validators.validateParticipantIds(data.participantIds);
    const client = whatsAppClientService.getClient(sessionId);
    const chat = await client.getChatById(data.groupId);
    if (!chat.isGroup) throw ApiError.badRequest('Chat is not a group', 'NOT_A_GROUP' as any);
    await (chat as any).removeParticipants(data.participantIds);
    logger.info(`Participants removed from group ${data.groupId}`);
  }

  async promoteParticipants(sessionId: string, data: IPromoteParticipantsDTO): Promise<void> {
    Validators.validateChatId(data.groupId);
    Validators.validateParticipantIds(data.participantIds);
    const client = whatsAppClientService.getClient(sessionId);
    const chat = await client.getChatById(data.groupId);
    if (!chat.isGroup) throw ApiError.badRequest('Chat is not a group', 'NOT_A_GROUP' as any);
    await (chat as any).promoteParticipants(data.participantIds);
    logger.info(`Participants promoted in group ${data.groupId}`);
  }

  async demoteParticipants(sessionId: string, data: IDemoteParticipantsDTO): Promise<void> {
    Validators.validateChatId(data.groupId);
    Validators.validateParticipantIds(data.participantIds);
    const client = whatsAppClientService.getClient(sessionId);
    const chat = await client.getChatById(data.groupId);
    if (!chat.isGroup) throw ApiError.badRequest('Chat is not a group', 'NOT_A_GROUP' as any);
    await (chat as any).demoteParticipants(data.participantIds);
    logger.info(`Participants demoted in group ${data.groupId}`);
  }

  async updateSubject(sessionId: string, data: IUpdateGroupSubjectDTO): Promise<void> {
    Validators.validateChatId(data.groupId);
    const client = whatsAppClientService.getClient(sessionId);
    const chat = await client.getChatById(data.groupId);
    if (!chat.isGroup) throw ApiError.badRequest('Chat is not a group', 'NOT_A_GROUP' as any);
    await (chat as any).setSubject(data.subject);
    logger.info(`Group ${data.groupId} subject updated`);
  }

  async updateDescription(sessionId: string, data: IUpdateGroupDescriptionDTO): Promise<void> {
    Validators.validateChatId(data.groupId);
    const client = whatsAppClientService.getClient(sessionId);
    const chat = await client.getChatById(data.groupId);
    if (!chat.isGroup) throw ApiError.badRequest('Chat is not a group', 'NOT_A_GROUP' as any);
    await (chat as any).setDescription(data.description);
    logger.info(`Group ${data.groupId} description updated`);
  }

  async updatePicture(sessionId: string, data: IUpdateGroupPictureDTO): Promise<void> {
    Validators.validateChatId(data.groupId);
    const client = whatsAppClientService.getClient(sessionId);
    const chat = await client.getChatById(data.groupId);
    if (!chat.isGroup) throw ApiError.badRequest('Chat is not a group', 'NOT_A_GROUP' as any);
    const media = new MessageMedia(data.media.mimetype, data.media.data);
    await (chat as any).setPicture(media);
    logger.info(`Group ${data.groupId} picture updated`);
  }

  async leaveGroup(sessionId: string, groupId: string): Promise<void> {
    Validators.validateChatId(groupId);
    const client = whatsAppClientService.getClient(sessionId);
    const chat = await client.getChatById(groupId);
    if (!chat.isGroup) throw ApiError.badRequest('Chat is not a group', 'NOT_A_GROUP' as any);
    await (chat as any).leave();
    logger.info(`Left group ${groupId}`);
  }

  async getInviteCode(sessionId: string, groupId: string): Promise<string> {
    Validators.validateChatId(groupId);
    const client = whatsAppClientService.getClient(sessionId);
    const chat = await client.getChatById(groupId);
    if (!chat.isGroup) throw ApiError.badRequest('Chat is not a group', 'NOT_A_GROUP' as any);
    const code = await (chat as any).getInviteCode();
    logger.info(`Got invite code for group ${groupId}`);
    return code;
  }

  async revokeInvite(sessionId: string, groupId: string): Promise<string> {
    Validators.validateChatId(groupId);
    const client = whatsAppClientService.getClient(sessionId);
    const chat = await client.getChatById(groupId);
    if (!chat.isGroup) throw ApiError.badRequest('Chat is not a group', 'NOT_A_GROUP' as any);
    const newCode = await (chat as any).revokeInvite();
    logger.info(`Revoked invite for group ${groupId}`);
    return newCode;
  }

  async acceptInvite(sessionId: string, inviteCode: string): Promise<string> {
    const client = whatsAppClientService.getClient(sessionId);
    const chatId = await client.acceptInvite(inviteCode);
    logger.info(`Accepted invite ${inviteCode}`);
    return chatId;
  }

  async setMessagesAdminsOnly(sessionId: string, data: ISetMessagesAdminsOnlyDTO): Promise<void> {
    Validators.validateChatId(data.groupId);
    const client = whatsAppClientService.getClient(sessionId);
    const chat = await client.getChatById(data.groupId);
    if (!chat.isGroup) throw ApiError.badRequest('Chat is not a group', 'NOT_A_GROUP' as any);
    await (chat as any).setMessagesAdminsOnly(data.adminsOnly);
    logger.info(`Group ${data.groupId} messages admins only set to ${data.adminsOnly}`);
  }
}

export const groupService = new GroupService();
