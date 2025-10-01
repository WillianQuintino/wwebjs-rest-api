# 📚 Internal Services Documentation

> Documentation for internal service functions and methods

## WhatsAppClientService

### `initializeClient(sessionId: string)`

**Description**: Initializes a new WhatsApp Web client instance with LocalAuth strategy.

**Parameters**:
- `sessionId` (string): Unique identifier for the session

**Returns**: `Promise<ISessionData>`

**Throws**:
- `ApiError.clientAlreadyExists()` - If session with same ID already exists
- `Error` - If client initialization fails

**Flow**:
1. Checks if session already exists
2. Creates new Client with LocalAuth
3. Sets up event listeners
4. Saves session to repository
5. Initializes WhatsApp Web connection
6. Returns session data

**Example**:
```typescript
const session = await whatsAppClientService.initializeClient('my-bot');
console.log(session.status); // 'INITIALIZING'
```

---

### `getClient(sessionId: string)`

**Description**: Retrieves an active WhatsApp client instance that is ready for operations.

**Parameters**:
- `sessionId` (string): Session identifier

**Returns**: `Client` (whatsapp-web.js Client instance)

**Throws**:
- `ApiError.clientNotFound()` - Session doesn't exist
- `ApiError.clientNotReady()` - Session exists but not ready

**Usage**:
```typescript
const client = whatsAppClientService.getClient('my-bot');
await client.sendMessage('5511999999999@c.us', 'Hello!');
```

**Important**: Always use this method instead of accessing repository directly. It validates session exists and is ready.

---

### `getClientInfo(sessionId: string)`

**Description**: Gets session information including status, QR code, and phone number.

**Parameters**:
- `sessionId` (string): Session identifier

**Returns**: `IClientInfo`
```typescript
{
  sessionId: string;
  status: SessionStatus;
  isReady: boolean;
  qrCode?: string;
  phoneNumber?: string;
  platform?: string;
  pushname?: string;
}
```

**Throws**:
- `ApiError.clientNotFound()` - Session doesn't exist

**Usage**:
```typescript
const info = whatsAppClientService.getClientInfo('my-bot');
if (info.status === 'READY') {
  console.log('Connected as:', info.phoneNumber);
}
```

---

### `destroyClient(sessionId: string)`

**Description**: Completely destroys a session, disconnecting from WhatsApp and cleaning up resources.

**Parameters**:
- `sessionId` (string): Session identifier

**Returns**: `Promise<void>`

**Throws**:
- `ApiError.clientNotFound()` - Session doesn't exist

**Side Effects**:
- Disconnects from WhatsApp Web
- Removes session from repository
- Clears authentication data
- Frees memory

**Usage**:
```typescript
await whatsAppClientService.destroyClient('my-bot');
// Session is completely removed
```

---

### `logoutClient(sessionId: string)`

**Description**: Gracefully logs out from WhatsApp Web while keeping session data.

**Parameters**:
- `sessionId` (string): Session identifier

**Returns**: `Promise<void>`

**Throws**:
- `ApiError.clientNotFound()` - Session doesn't exist
- `ApiError.clientNotReady()` - Session not ready

**Difference from destroy**:
- **logout**: Soft disconnect, can reconnect later
- **destroy**: Hard cleanup, must recreate session

**Usage**:
```typescript
await whatsAppClientService.logoutClient('my-bot');
// Can reinitialize same session later
```

---

### `getAllSessions()`

**Description**: Retrieves list of all active sessions.

**Returns**: `IClientInfo[]`

**Usage**:
```typescript
const sessions = whatsAppClientService.getAllSessions();
console.log(`Total sessions: ${sessions.length}`);
```

---

### `cleanupOldSessions(threshold?: number)`

**Description**: Removes disconnected sessions older than threshold.

**Parameters**:
- `threshold` (number, optional): Time in milliseconds (default: 3600000 = 1 hour)

**Returns**: `void`

**Usage**:
```typescript
// Cleanup sessions disconnected > 1 hour
whatsAppClientService.cleanupOldSessions();

// Custom threshold: 30 minutes
whatsAppClientService.cleanupOldSessions(1800000);
```

---

### `getState(sessionId: string)`

**Description**: Gets the current WhatsApp Web connection state.

**Parameters**:
- `sessionId` (string): Session identifier

**Returns**: `Promise<WAState>`

**Possible States**:
- `CONFLICT` - Multiple sessions detected
- `CONNECTED` - Successfully connected
- `DEPRECATED_VERSION` - WhatsApp Web outdated
- `OPENING` - Establishing connection
- `PAIRING` - Waiting for QR scan
- `TIMEOUT` - Connection timeout
- `UNLAUNCHED` - Not yet launched
- `UNPAIRED` - Not paired

**Usage**:
```typescript
const state = await whatsAppClientService.getState('my-bot');
if (state === 'CONNECTED') {
  console.log('Connection healthy');
}
```

---

### `getBatteryStatus(sessionId: string)`

**Description**: Gets battery status of connected mobile device.

**Parameters**:
- `sessionId` (string): Session identifier

**Returns**: `Promise<{ battery: number; plugged: boolean }>`

**Usage**:
```typescript
const { battery, plugged } = await whatsAppClientService.getBatteryStatus('my-bot');
if (battery < 20 && !plugged) {
  console.warn('Low battery warning!');
}
```

---

## MessageService

### `sendMessage(sessionId: string, dto: ISendMessageDTO)`

**Description**: Sends a text message to a chat.

**Parameters**:
- `sessionId` (string): Session identifier
- `dto` (ISendMessageDTO):
  ```typescript
  {
    chatId: string;           // '5511999999999@c.us' or '123456789@g.us'
    content: string;          // Message text
    options?: {
      quotedMessageId?: string;  // Reply to message
      mentions?: string[];       // Mention users
      linkPreview?: boolean;     // Enable link preview
    }
  }
  ```

**Returns**: `Promise<IMessageResponse>`

**Usage**:
```typescript
const message = await messageService.sendMessage('my-bot', {
  chatId: '5511999999999@c.us',
  content: 'Hello, World!',
  options: {
    linkPreview: true
  }
});
```

---

### `sendMedia(sessionId: string, dto: ISendMediaDTO)`

**Description**: Sends media file (image, video, audio, document).

**Parameters**:
- `sessionId` (string): Session identifier
- `dto` (ISendMediaDTO):
  ```typescript
  {
    chatId: string;
    media: {
      mimetype: string;    // 'image/jpeg', 'video/mp4', etc.
      data: string;        // Base64 encoded data
      filename?: string;   // Optional filename
    };
    options?: {
      caption?: string;    // Media caption
    }
  }
  ```

**Supported Types**:
- Images: `image/jpeg`, `image/png`, `image/webp`
- Videos: `video/mp4`, `video/3gpp`
- Audio: `audio/mpeg`, `audio/ogg`
- Documents: `application/pdf`, etc.

**Max Size**: 16MB (configurable via `MAX_FILE_SIZE` env)

**Usage**:
```typescript
const message = await messageService.sendMedia('my-bot', {
  chatId: '5511999999999@c.us',
  media: {
    mimetype: 'image/jpeg',
    data: 'base64-encoded-data-here',
    filename: 'photo.jpg'
  },
  options: {
    caption: 'Check this out!'
  }
});
```

---

### `reactToMessage(sessionId: string, dto: IReactToMessageDTO)`

**Description**: Adds emoji reaction to a message.

**Parameters**:
- `sessionId` (string): Session identifier
- `dto`:
  ```typescript
  {
    messageId: string;
    chatId: string;
    emoji: string;  // Single emoji
  }
  ```

**Usage**:
```typescript
await messageService.reactToMessage('my-bot', {
  messageId: 'message-id-here',
  chatId: '5511999999999@c.us',
  emoji: '👍'
});
```

---

## ChatService

### `getAllChats(sessionId: string)`

**Description**: Retrieves all chats (individual and groups).

**Returns**: `Promise<IChatResponse[]>`

**Usage**:
```typescript
const chats = await chatService.getAllChats('my-bot');
const unreadChats = chats.filter(c => c.unreadCount > 0);
```

---

### `archiveChat(sessionId: string, dto: IArchiveChatDTO)`

**Description**: Archives or unarchives a chat.

**Parameters**:
- `dto`:
  ```typescript
  {
    chatId: string;
    archive: boolean;  // true = archive, false = unarchive
  }
  ```

**Usage**:
```typescript
await chatService.archiveChat('my-bot', {
  chatId: '5511999999999@c.us',
  archive: true
});
```

---

## Helper Functions & Utilities

### Internal Helpers (Private)

These are internal helper methods not exposed via API:

#### `setupClientEvents(client: Client, sessionId: string)`
- Sets up event listeners for WhatsApp client
- Handles: qr, authenticated, ready, disconnected, message events
- Updates session status in repository

#### `getQrTextFromSession(sessionId: string)`
- Retrieves original QR text from session
- Used for generating SVG/ASCII QR codes
- Returns null if not available

---

## Best Practices

### 1. Always use `getClient()` instead of direct repository access
```typescript
// ✅ GOOD
const client = whatsAppClientService.getClient(sessionId);

// ❌ BAD
const session = sessionRepository.findById(sessionId);
const client = session.client;
```

### 2. Handle errors properly
```typescript
try {
  const client = whatsAppClientService.getClient(sessionId);
} catch (error) {
  if (error.code === 'CLIENT_NOT_FOUND') {
    // Initialize new session
  } else if (error.code === 'CLIENT_NOT_READY') {
    // Wait for QR scan
  }
}
```

### 3. Check session status before operations
```typescript
const info = whatsAppClientService.getClientInfo(sessionId);
if (info.status === 'READY') {
  // Safe to send messages
}
```

### 4. Cleanup disconnected sessions periodically
```typescript
// In your startup code or cron job
setInterval(() => {
  whatsAppClientService.cleanupOldSessions();
}, 3600000); // Every hour
```
