// Client Controller
export * from './ClientController';
export * from './MessageController';

import { Request, Response } from 'express';
import { chatService, groupService, contactService, profileService } from '../services';
import { ApiResponse } from '../utils';

// Chat Controller
export class ChatController {
  /**
   * @swagger
   * /sessions/{sessionId}/chats:
   *   get:
   *     summary: Get all chats from WhatsApp account
   *     description: |
   *       Retrieves all conversations (individual chats, groups, broadcasts) from the authenticated WhatsApp account.
   *       
   *       **Chat Types Returned:**
   *       - **Individual chats**: Direct conversations with contacts
   *       - **Group chats**: WhatsApp groups you're part of
   *       - **Broadcast lists**: Your broadcast lists (if any)
   *       
   *       **Chat Information Includes:**
   *       - Chat ID and name
   *       - Last message preview
   *       - Unread message count
   *       - Chat status (archived, pinned, muted)
   *       - Participant count (for groups)
   *       - Profile picture URLs
   *       
   *       **Sorting & Filtering:**
   *       - Chats are sorted by last message timestamp
   *       - Includes both active and archived chats
   *       - Shows muted and unmuted conversations
   *       
   *       **Requirements:**
   *       - Session must be authenticated (status: READY)
   *       - WhatsApp account must have chat history
   *     tags: [📊 Chats]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *           example: "chat-manager"
   *         required: true
   *         description: The session identifier
   *     responses:
   *       200:
   *         description: List of all chats retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/ApiResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             example: "5511999999999@c.us"
   *                           name:
   *                             type: string
   *                             example: "John Doe"
   *                           isGroup:
   *                             type: boolean
   *                             example: false
   *                           isReadOnly:
   *                             type: boolean
   *                             example: false
   *                           unreadCount:
   *                             type: number
   *                             example: 3
   *                           timestamp:
   *                             type: number
   *                             example: 1635724800
   *                           lastMessage:
   *                             type: object
   *                             properties:
   *                               body:
   *                                 type: string
   *                                 example: "Hello, how are you?"
   *                               type:
   *                                 type: string
   *                                 example: "chat"
   *                               timestamp:
   *                                 type: number
   *                                 example: 1635724800
   *                           archived:
   *                             type: boolean
   *                             example: false
   *                           pinned:
   *                             type: boolean
   *                             example: false
   *                           isMuted:
   *                             type: boolean
   *                             example: false
   *       401:
   *         description: Session not authenticated
   *       500:
   *         description: Internal server error
   */
  async getAll(req: Request, res: Response) {
    const chats = await chatService.getAllChats(req.params.sessionId);
    return ApiResponse.success(res, chats);
  }

  /**
   * @swagger
   * /sessions/{sessionId}/chats/{chatId}:
   *   get:
   *     summary: Get specific chat details and metadata
   *     description: |
   *       Retrieves detailed information about a specific WhatsApp chat or group.
   *       
   *       **Detailed Information Includes:**
   *       - Chat metadata (name, description, creation date)
   *       - Participant list (for groups)
   *       - Admin status (for groups)
   *       - Chat settings (muted, archived, pinned)
   *       - Recent message history preview
   *       - Profile pictures and contact info
   *       
   *       **Chat Types Supported:**
   *       - Individual contacts
   *       - Group conversations
   *       - Broadcast lists
   *       
   *       **Requirements:**
   *       - Session must be authenticated (status: READY)
   *       - Chat ID must exist and be accessible
   *       - User must be participant in group chats
   *     tags: [📊 Chats]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *           example: "chat-details"
   *         required: true
   *         description: The session identifier
   *       - in: path
   *         name: chatId
   *         schema:
   *           type: string
   *           example: "5511999999999@c.us"
   *         required: true
   *         description: WhatsApp chat ID (individual or group)
   *     responses:
   *       200:
   *         description: Chat details retrieved successfully
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
   *                         id:
   *                           type: string
   *                           example: "120363123456789012@g.us"
   *                         name:
   *                           type: string
   *                           example: "Family Group"
   *                         isGroup:
   *                           type: boolean
   *                           example: true
   *                         participants:
   *                           type: array
   *                           items:
   *                             type: object
   *                             properties:
   *                               id:
   *                                 type: string
   *                                 example: "5511888888888@c.us"
   *                               isAdmin:
   *                                 type: boolean
   *                                 example: false
   *                               isSuperAdmin:
   *                                 type: boolean
   *                                 example: false
   *                         description:
   *                           type: string
   *                           example: "Welcome to our family group!"
   *                         createdAt:
   *                           type: number
   *                           example: 1635724800
   *                         owner:
   *                           type: string
   *                           example: "5511777777777@c.us"
   *       400:
   *         description: Invalid chat ID format
   *       404:
   *         description: Chat not found or not accessible
   *       401:
   *         description: Session not authenticated
   *       500:
   *         description: Internal server error
   */
  async getById(req: Request, res: Response) {
    const chat = await chatService.getChatById(req.params.sessionId, req.params.chatId);
    return ApiResponse.success(res, chat);
  }

  /**
   * @swagger
   * /sessions/{sessionId}/chats/archive:
   *   post:
   *     summary: Archive or unarchive WhatsApp chats
   *     description: |
   *       Archives or unarchives WhatsApp conversations to organize your chat list.
   *       
   *       **Archive Benefits:**
   *       - Hides chats from main chat list
   *       - Reduces clutter in active conversations
   *       - Maintains chat history and searchability
   *       - Easy to unarchive when needed
   *       
   *       **Archive Behavior:**
   *       - Archived chats appear in "Archived" section
   *       - New messages in archived chats show notifications
   *       - Group admin functions still work in archived groups
   *       - Can archive/unarchive multiple chats at once
   *       
   *       **Requirements:**
   *       - Session must be authenticated (status: READY)
   *       - Chat IDs must be valid and accessible
   *       - Can archive both individual and group chats
   *     tags: [📊 Chats]
   *     parameters:
   *       - in: path
   *         name: sessionId
   *         schema:
   *           type: string
   *           example: "archive-manager"
   *         required: true
   *         description: The session identifier
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [chatId, archive]
   *             properties:
   *               chatId:
   *                 type: string
   *                 example: "5511999999999@c.us"
   *                 description: WhatsApp chat ID to archive/unarchive
   *                 pattern: '^[0-9]+@(c\.us|g\.us|broadcast)$'
   *               archive:
   *                 type: boolean
   *                 example: true
   *                 description: true to archive, false to unarchive
   *           examples:
   *             archive_chat:
   *               summary: Archive a chat
   *               value:
   *                 chatId: "5511999999999@c.us"
   *                 archive: true
   *             unarchive_group:
   *               summary: Unarchive a group
   *               value:
   *                 chatId: "120363123456789012@g.us"
   *                 archive: false
   *     responses:
   *       200:
   *         description: Chat archived/unarchived successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ApiResponse'
   *       400:
   *         description: Invalid chat ID or archive parameter
   *       404:
   *         description: Chat not found
   *       401:
   *         description: Session not authenticated
   *       500:
   *         description: Internal server error
   */
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
