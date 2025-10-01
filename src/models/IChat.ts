export interface IChatResponse {
  id: string;
  name: string;
  isGroup: boolean;
  isReadOnly: boolean;
  unreadCount: number;
  timestamp: number;
  archived: boolean;
  pinned: boolean;
  isMuted: boolean;
  muteExpiration?: number;
  lastMessage?: {
    id: string;
    body: string;
    timestamp: number;
    fromMe: boolean;
  };
}

export interface IGroupChatResponse extends IChatResponse {
  participants: IParticipant[];
  owner: string;
  createdAt: number;
  description?: string;
  inviteCode?: string;
}

export interface IParticipant {
  id: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export interface IArchiveChatDTO {
  chatId: string;
  archive: boolean;
}

export interface IPinChatDTO {
  chatId: string;
  pin: boolean;
}

export interface IMuteChatDTO {
  chatId: string;
  mute: boolean;
  duration?: number; // em segundos
}

export interface IMarkChatDTO {
  chatId: string;
  unread: boolean;
}

export interface ISendSeenDTO {
  chatId: string;
}

export interface ISendPresenceDTO {
  chatId: string;
  presence: 'typing' | 'recording' | 'available' | 'unavailable';
}

export interface IClearChatDTO {
  chatId: string;
}

export interface IDeleteChatDTO {
  chatId: string;
}

export interface IGetChatLabelsDTO {
  chatId: string;
}

export interface IChangeLabelsDTO {
  chatId: string;
  labelIds: string[];
}
