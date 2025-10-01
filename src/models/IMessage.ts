export interface ISendMessageDTO {
  chatId: string;
  content: string;
  options?: ISendMessageOptions;
}

export interface ISendMessageOptions {
  quotedMessageId?: string;
  mentions?: string[];
  caption?: string;
  sendAudioAsVoice?: boolean;
  parseVCards?: boolean;
  linkPreview?: boolean;
}

export interface ISendMediaDTO {
  chatId: string;
  media: IMediaData;
  options?: ISendMessageOptions;
}

export interface IMediaData {
  mimetype: string;
  data: string; // base64
  filename?: string;
  filesize?: number;
}

export interface ISendLocationDTO {
  chatId: string;
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export interface ISendContactDTO {
  chatId: string;
  contactId: string;
}

export interface ISendPollDTO {
  chatId: string;
  question: string;
  options: string[];
  allowMultipleAnswers?: boolean;
}

export interface IMessageResponse {
  id: string;
  body: string;
  from: string;
  to: string;
  timestamp: number;
  type: string;
  hasMedia: boolean;
  fromMe: boolean;
  isForwarded: boolean;
  ack?: number;
}

export interface IReactToMessageDTO {
  messageId: string;
  chatId: string;
  emoji: string;
}

export interface IForwardMessageDTO {
  messageId: string;
  sourceChatId: string;
  targetChatId: string;
}

export interface IDeleteMessageDTO {
  messageId: string;
  chatId: string;
  deleteForEveryone: boolean;
}

export interface IEditMessageDTO {
  messageId: string;
  chatId: string;
  newContent: string;
}

export interface IFetchMessagesDTO {
  chatId: string;
  limit?: number;
  searchOptions?: {
    fromMe?: boolean;
    limit?: number;
  };
}

export interface ISearchMessagesDTO {
  query: string;
  chatId?: string;
  limit?: number;
}
