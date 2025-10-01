// Client Controller
export * from './ClientController';
export * from './MessageController';

import { Request, Response } from 'express';
import { chatService, groupService, contactService, profileService } from '../services';
import { ApiResponse } from '../utils';

// Chat Controller
export class ChatController {
  async getAll(req: Request, res: Response) {
    const chats = await chatService.getAllChats(req.params.sessionId);
    return ApiResponse.success(res, chats);
  }

  async getById(req: Request, res: Response) {
    const chat = await chatService.getChatById(req.params.sessionId, req.params.chatId);
    return ApiResponse.success(res, chat);
  }

  async archive(req: Request, res: Response) {
    await chatService.archiveChat(req.params.sessionId, req.body);
    return ApiResponse.success(res, null, 'Chat archived successfully');
  }

  async pin(req: Request, res: Response) {
    await chatService.pinChat(req.params.sessionId, req.body);
    return ApiResponse.success(res, null, 'Chat pinned successfully');
  }

  async mute(req: Request, res: Response) {
    await chatService.muteChat(req.params.sessionId, req.body);
    return ApiResponse.success(res, null, 'Chat muted successfully');
  }

  async markUnread(req: Request, res: Response) {
    await chatService.markUnread(req.params.sessionId, req.params.chatId);
    return ApiResponse.success(res, null, 'Chat marked as unread');
  }

  async sendSeen(req: Request, res: Response) {
    await chatService.sendSeen(req.params.sessionId, req.params.chatId);
    return ApiResponse.success(res, null, 'Seen sent successfully');
  }

  async sendTyping(req: Request, res: Response) {
    await chatService.sendTyping(req.params.sessionId, req.params.chatId);
    return ApiResponse.success(res, null, 'Typing state sent');
  }

  async sendRecording(req: Request, res: Response) {
    await chatService.sendRecording(req.params.sessionId, req.params.chatId);
    return ApiResponse.success(res, null, 'Recording state sent');
  }

  async clear(req: Request, res: Response) {
    await chatService.clearMessages(req.params.sessionId, req.params.chatId);
    return ApiResponse.success(res, null, 'Chat cleared successfully');
  }

  async delete(req: Request, res: Response) {
    await chatService.deleteChat(req.params.sessionId, req.params.chatId);
    return ApiResponse.success(res, null, 'Chat deleted successfully');
  }
}

// Group Controller
export class GroupController {
  async create(req: Request, res: Response) {
    const group = await groupService.createGroup(req.params.sessionId, req.body);
    return ApiResponse.created(res, group, 'Group created successfully');
  }

  async addParticipants(req: Request, res: Response) {
    await groupService.addParticipants(req.params.sessionId, req.body);
    return ApiResponse.success(res, null, 'Participants added successfully');
  }

  async removeParticipants(req: Request, res: Response) {
    await groupService.removeParticipants(req.params.sessionId, req.body);
    return ApiResponse.success(res, null, 'Participants removed successfully');
  }

  async promoteParticipants(req: Request, res: Response) {
    await groupService.promoteParticipants(req.params.sessionId, req.body);
    return ApiResponse.success(res, null, 'Participants promoted successfully');
  }

  async demoteParticipants(req: Request, res: Response) {
    await groupService.demoteParticipants(req.params.sessionId, req.body);
    return ApiResponse.success(res, null, 'Participants demoted successfully');
  }

  async updateSubject(req: Request, res: Response) {
    await groupService.updateSubject(req.params.sessionId, req.body);
    return ApiResponse.success(res, null, 'Group subject updated successfully');
  }

  async updateDescription(req: Request, res: Response) {
    await groupService.updateDescription(req.params.sessionId, req.body);
    return ApiResponse.success(res, null, 'Group description updated successfully');
  }

  async updatePicture(req: Request, res: Response) {
    await groupService.updatePicture(req.params.sessionId, req.body);
    return ApiResponse.success(res, null, 'Group picture updated successfully');
  }

  async leave(req: Request, res: Response) {
    await groupService.leaveGroup(req.params.sessionId, req.params.groupId);
    return ApiResponse.success(res, null, 'Left group successfully');
  }

  async getInviteCode(req: Request, res: Response) {
    const code = await groupService.getInviteCode(req.params.sessionId, req.params.groupId);
    return ApiResponse.success(res, { inviteCode: code });
  }

  async revokeInvite(req: Request, res: Response) {
    const code = await groupService.revokeInvite(req.params.sessionId, req.params.groupId);
    return ApiResponse.success(res, { inviteCode: code }, 'Invite revoked successfully');
  }

  async acceptInvite(req: Request, res: Response) {
    const chatId = await groupService.acceptInvite(req.params.sessionId, req.body.inviteCode);
    return ApiResponse.success(res, { chatId }, 'Invite accepted successfully');
  }
}

// Contact Controller
export class ContactController {
  async getAll(req: Request, res: Response) {
    const contacts = await contactService.getAllContacts(req.params.sessionId);
    return ApiResponse.success(res, contacts);
  }

  async getById(req: Request, res: Response) {
    const contact = await contactService.getContactById(req.params.sessionId, req.params.contactId);
    return ApiResponse.success(res, contact);
  }

  async getProfilePic(req: Request, res: Response) {
    const url = await contactService.getProfilePicUrl(req.params.sessionId, req.params.contactId);
    return ApiResponse.success(res, { url });
  }

  async getAbout(req: Request, res: Response) {
    const about = await contactService.getAbout(req.params.sessionId, req.params.contactId);
    return ApiResponse.success(res, { about });
  }

  async getCommonGroups(req: Request, res: Response) {
    const groups = await contactService.getCommonGroups(req.params.sessionId, req.params.contactId);
    return ApiResponse.success(res, groups);
  }

  async block(req: Request, res: Response) {
    await contactService.blockContact(req.params.sessionId, req.params.contactId);
    return ApiResponse.success(res, null, 'Contact blocked successfully');
  }

  async unblock(req: Request, res: Response) {
    await contactService.unblockContact(req.params.sessionId, req.params.contactId);
    return ApiResponse.success(res, null, 'Contact unblocked successfully');
  }

  async validateNumber(req: Request, res: Response) {
    const result = await contactService.validateNumber(req.params.sessionId, req.body);
    return ApiResponse.success(res, result);
  }

  async getBlocked(req: Request, res: Response) {
    const blocked = await contactService.getBlockedContacts(req.params.sessionId);
    return ApiResponse.success(res, blocked);
  }

  async save(req: Request, res: Response) {
    await contactService.saveContact(req.params.sessionId, req.body);
    return ApiResponse.success(res, null, 'Contact saved successfully');
  }
}

// Profile Controller
export class ProfileController {
  async get(req: Request, res: Response) {
    const profile = await profileService.getProfile(req.params.sessionId);
    return ApiResponse.success(res, profile);
  }

  async setName(req: Request, res: Response) {
    await profileService.setDisplayName(req.params.sessionId, req.body);
    return ApiResponse.success(res, null, 'Display name updated successfully');
  }

  async setStatus(req: Request, res: Response) {
    await profileService.setStatus(req.params.sessionId, req.body);
    return ApiResponse.success(res, null, 'Status updated successfully');
  }

  async setPicture(req: Request, res: Response) {
    await profileService.setProfilePicture(req.params.sessionId, req.body);
    return ApiResponse.success(res, null, 'Profile picture updated successfully');
  }

  async deletePicture(req: Request, res: Response) {
    await profileService.deleteProfilePicture(req.params.sessionId);
    return ApiResponse.success(res, null, 'Profile picture deleted successfully');
  }

  async getBattery(req: Request, res: Response) {
    const battery = await profileService.getBatteryStatus(req.params.sessionId);
    return ApiResponse.success(res, battery);
  }
}

// Export instances
export const chatController = new ChatController();
export const groupController = new GroupController();
export const contactController = new ContactController();
export const profileController = new ProfileController();
