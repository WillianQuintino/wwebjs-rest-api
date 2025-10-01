import { Router } from 'express';
import { asyncHandler } from '../middlewares';
import {
  clientController,
  messageController,
  chatController,
  groupController,
  contactController,
  profileController
} from '../controllers';

const router = Router();

// ===== CLIENT ROUTES =====
router.post('/sessions/:sessionId/init', asyncHandler(clientController.initializeSession.bind(clientController)));
router.get('/sessions/:sessionId', asyncHandler(clientController.getSession.bind(clientController)));
router.get('/sessions', asyncHandler(clientController.getAllSessions.bind(clientController)));
router.delete('/sessions/:sessionId', asyncHandler(clientController.destroySession.bind(clientController)));
router.post('/sessions/:sessionId/logout', asyncHandler(clientController.logoutSession.bind(clientController)));
router.get('/sessions/:sessionId/state', asyncHandler(clientController.getState.bind(clientController)));
router.get('/sessions/:sessionId/battery', asyncHandler(clientController.getBattery.bind(clientController)));

// ===== MESSAGE ROUTES =====
router.post('/sessions/:sessionId/messages/send', asyncHandler(messageController.sendMessage.bind(messageController)));
router.post('/sessions/:sessionId/messages/send-media', asyncHandler(messageController.sendMedia.bind(messageController)));
router.post('/sessions/:sessionId/messages/send-location', asyncHandler(messageController.sendLocation.bind(messageController)));
router.post('/sessions/:sessionId/messages/send-poll', asyncHandler(messageController.sendPoll.bind(messageController)));
router.post('/sessions/:sessionId/messages/react', asyncHandler(messageController.react.bind(messageController)));
router.post('/sessions/:sessionId/messages/forward', asyncHandler(messageController.forward.bind(messageController)));
router.delete('/sessions/:sessionId/messages', asyncHandler(messageController.delete.bind(messageController)));
router.put('/sessions/:sessionId/messages/edit', asyncHandler(messageController.edit.bind(messageController)));
router.get('/sessions/:sessionId/messages/:chatId', asyncHandler(messageController.fetchMessages.bind(messageController)));
router.post('/sessions/:sessionId/messages/search', asyncHandler(messageController.searchMessages.bind(messageController)));
router.get('/sessions/:sessionId/messages/:chatId/:messageId/media', asyncHandler(messageController.downloadMedia.bind(messageController)));

// ===== CHAT ROUTES =====
router.get('/sessions/:sessionId/chats', asyncHandler(chatController.getAll.bind(chatController)));
router.get('/sessions/:sessionId/chats/:chatId', asyncHandler(chatController.getById.bind(chatController)));
router.post('/sessions/:sessionId/chats/archive', asyncHandler(chatController.archive.bind(chatController)));
router.post('/sessions/:sessionId/chats/pin', asyncHandler(chatController.pin.bind(chatController)));
router.post('/sessions/:sessionId/chats/mute', asyncHandler(chatController.mute.bind(chatController)));
router.post('/sessions/:sessionId/chats/:chatId/mark-unread', asyncHandler(chatController.markUnread.bind(chatController)));
router.post('/sessions/:sessionId/chats/:chatId/send-seen', asyncHandler(chatController.sendSeen.bind(chatController)));
router.post('/sessions/:sessionId/chats/:chatId/send-typing', asyncHandler(chatController.sendTyping.bind(chatController)));
router.post('/sessions/:sessionId/chats/:chatId/send-recording', asyncHandler(chatController.sendRecording.bind(chatController)));
router.post('/sessions/:sessionId/chats/:chatId/clear', asyncHandler(chatController.clear.bind(chatController)));
router.delete('/sessions/:sessionId/chats/:chatId', asyncHandler(chatController.delete.bind(chatController)));

// ===== GROUP ROUTES =====
router.post('/sessions/:sessionId/groups', asyncHandler(groupController.create.bind(groupController)));
router.post('/sessions/:sessionId/groups/add-participants', asyncHandler(groupController.addParticipants.bind(groupController)));
router.post('/sessions/:sessionId/groups/remove-participants', asyncHandler(groupController.removeParticipants.bind(groupController)));
router.post('/sessions/:sessionId/groups/promote-participants', asyncHandler(groupController.promoteParticipants.bind(groupController)));
router.post('/sessions/:sessionId/groups/demote-participants', asyncHandler(groupController.demoteParticipants.bind(groupController)));
router.put('/sessions/:sessionId/groups/subject', asyncHandler(groupController.updateSubject.bind(groupController)));
router.put('/sessions/:sessionId/groups/description', asyncHandler(groupController.updateDescription.bind(groupController)));
router.put('/sessions/:sessionId/groups/picture', asyncHandler(groupController.updatePicture.bind(groupController)));
router.post('/sessions/:sessionId/groups/:groupId/leave', asyncHandler(groupController.leave.bind(groupController)));
router.get('/sessions/:sessionId/groups/:groupId/invite-code', asyncHandler(groupController.getInviteCode.bind(groupController)));
router.post('/sessions/:sessionId/groups/:groupId/revoke-invite', asyncHandler(groupController.revokeInvite.bind(groupController)));
router.post('/sessions/:sessionId/groups/accept-invite', asyncHandler(groupController.acceptInvite.bind(groupController)));

// ===== CONTACT ROUTES =====
router.get('/sessions/:sessionId/contacts', asyncHandler(contactController.getAll.bind(contactController)));
router.get('/sessions/:sessionId/contacts/:contactId', asyncHandler(contactController.getById.bind(contactController)));
router.get('/sessions/:sessionId/contacts/:contactId/profile-pic', asyncHandler(contactController.getProfilePic.bind(contactController)));
router.get('/sessions/:sessionId/contacts/:contactId/about', asyncHandler(contactController.getAbout.bind(contactController)));
router.get('/sessions/:sessionId/contacts/:contactId/common-groups', asyncHandler(contactController.getCommonGroups.bind(contactController)));
router.post('/sessions/:sessionId/contacts/:contactId/block', asyncHandler(contactController.block.bind(contactController)));
router.post('/sessions/:sessionId/contacts/:contactId/unblock', asyncHandler(contactController.unblock.bind(contactController)));
router.post('/sessions/:sessionId/contacts/validate-number', asyncHandler(contactController.validateNumber.bind(contactController)));
router.get('/sessions/:sessionId/contacts/blocked', asyncHandler(contactController.getBlocked.bind(contactController)));
router.post('/sessions/:sessionId/contacts/save', asyncHandler(contactController.save.bind(contactController)));

// ===== PROFILE ROUTES =====
router.get('/sessions/:sessionId/profile', asyncHandler(profileController.get.bind(profileController)));
router.put('/sessions/:sessionId/profile/name', asyncHandler(profileController.setName.bind(profileController)));
router.put('/sessions/:sessionId/profile/status', asyncHandler(profileController.setStatus.bind(profileController)));
router.put('/sessions/:sessionId/profile/picture', asyncHandler(profileController.setPicture.bind(profileController)));
router.delete('/sessions/:sessionId/profile/picture', asyncHandler(profileController.deletePicture.bind(profileController)));
router.get('/sessions/:sessionId/profile/battery', asyncHandler(profileController.getBattery.bind(profileController)));

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
