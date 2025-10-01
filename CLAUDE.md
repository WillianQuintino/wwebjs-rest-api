# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Run development server:**
```bash
npm run dev
```
Uses tsx watch mode for hot reloading.

**Build for production:**
```bash
npm run build
```
Compiles TypeScript to `dist/` directory.

**Start production server:**
```bash
npm start
```

**Linting and formatting:**
```bash
npm run lint
npm run format
```

## Architecture Overview

This is a WhatsApp Web.js REST API built with **Clean Architecture** and **SOLID principles**. The codebase follows a strict layered approach:

### Layer Flow
```
Routes → Controllers → Services → Repositories → WhatsApp Client
  ↓          ↓           ↓            ↓
Middlewares Utils      Models      Config
```

### Key Architectural Patterns

**1. Singleton Services**
All services (WhatsAppClientService, MessageService, ChatService, GroupService, ContactService, ProfileService) use the Singleton pattern. They are instantiated once via `getInstance()` and exported as a singleton instance at the bottom of each service file.

**2. Session Management**
- Sessions are stored in-memory via `SessionRepository`
- Each WhatsApp connection has a unique `sessionId`
- Multi-session support: one API can manage multiple WhatsApp accounts simultaneously
- Session data includes: Client instance, status, QR code, ready state, timestamps

**3. Event-Driven Architecture**
`WhatsAppClientService` extends EventEmitter and emits events:
- `qr` - QR code generated for authentication
- `authenticated` - Client authenticated successfully
- `ready` - Client is ready to send/receive messages
- `disconnected` - Client disconnected
- `message` - New message received
- Event listeners are set up in `setupClientEvents()` method

**4. TypeScript Path Aliases**
The project uses path aliases (defined in tsconfig.json):
```typescript
@config/*      → src/config/*
@services/*    → src/services/*
@repositories/* → src/repositories/*
@models/*      → src/models/*
@controllers/* → src/controllers/*
@middlewares/* → src/middlewares/*
@utils/*       → src/utils/*
@routes/*      → src/routes/*
```

**5. Error Handling**
- Custom `ApiError` class with factory methods (`clientNotFound()`, `clientNotReady()`, `badRequest()`, etc.)
- Centralized error handling via `errorHandler` middleware
- `asyncHandler` middleware wraps async route handlers to catch errors
- All service methods throw typed ApiErrors

**6. Dependency Injection**
Services depend on abstractions (interfaces) not concrete implementations:
- Services use the SessionRepository singleton
- Controllers use service singletons
- All dependencies are injected via constructor or method parameters

**7. Client Lifecycle**
When a session is initialized:
1. `POST /sessions/:sessionId/init` → `clientController.initializeSession()`
2. Controller calls `whatsAppClientService.initializeClient(sessionId)`
3. Service creates new whatsapp-web.js Client with LocalAuth
4. Client is saved to SessionRepository with status INITIALIZING
5. Event listeners are attached via `setupClientEvents()`
6. Client emits 'qr' event → QR code stored in session
7. User scans QR → Client emits 'authenticated' → Status updated
8. Client emits 'ready' → `isReady` flag set to true
9. Session is now ready for message operations

## Important Implementation Details

**WhatsApp Client Retrieval:**
Always use `whatsAppClientService.getClient(sessionId)` to get a client. This method:
- Checks if session exists (throws `clientNotFound` if not)
- Checks if session is ready (throws `clientNotReady` if not)
- Returns the whatsapp-web.js Client instance

**Media Handling:**
- All media (images, videos, audio, documents) is sent as base64-encoded data
- Use `mimetype`, `data`, and `filename` fields in `ISendMediaDTO`
- Media download returns base64 data via `downloadMedia()` method

**Chat ID Format:**
- Individual: `5511999999999@c.us`
- Group: `123456789@g.us`
- Validators in `@utils/validators.ts` enforce correct format

**Session Cleanup:**
- Old disconnected sessions are cleaned up on server start via `cleanupOldSessions()`
- Cleanup threshold: 1 hour (3600000ms)
- Can be called manually via `whatsAppClientService.cleanupOldSessions()`

## Configuration

All configuration is in `src/config/`:
- `env.ts` - Environment variables validation and access
- `logger.ts` - Winston logger setup (console + file transports)
- `whatsapp.ts` - Puppeteer/WhatsApp client configuration

Required environment variables in `.env`:
- `PORT` - Server port (default: 3000)
- `SESSION_PATH` - Path to store session data
- `PUPPETEER_HEADLESS` - Run browser headless (true/false)

## Adding New Features

**To add a new WhatsApp operation:**

1. Add DTO interface in `src/models/I{Domain}.ts`
2. Add method to appropriate service in `src/services/{Domain}Service.ts`
3. Add controller method in `src/controllers/{Domain}Controller.ts`
4. Add route in `src/routes/index.ts`
5. Export new types in `src/models/index.ts`

**Example - Adding "star message" feature:**

1. `src/models/IMessage.ts`:
```typescript
export interface IStarMessageDTO {
  chatId: string;
  messageId: string;
  star: boolean;
}
```

2. `src/services/MessageService.ts`:
```typescript
async starMessage(sessionId: string, dto: IStarMessageDTO): Promise<void> {
  const client = this.whatsAppClientService.getClient(sessionId);
  const message = await client.getMessageById(dto.messageId);
  await message.star();
}
```

3. `src/controllers/MessageController.ts`:
```typescript
async star(req: Request, res: Response) {
  const { sessionId } = req.params;
  await messageService.starMessage(sessionId, req.body);
  return ApiResponse.success(res, null, 'Message starred');
}
```

4. `src/routes/index.ts`:
```typescript
router.post('/sessions/:sessionId/messages/star', asyncHandler(messageController.star.bind(messageController)));
```

## Testing the API

Use examples from `EXAMPLES.md`. Basic flow:

1. Initialize session: `POST /api/v1/sessions/my-session/init`
2. Scan QR code from response
3. Check status: `GET /api/v1/sessions/my-session` (wait for `READY`)
4. Send message: `POST /api/v1/sessions/my-session/messages/send`

## Common Pitfalls

- **Don't instantiate services directly** - Always use singleton instances exported from service files
- **Don't bypass getClient()** - Always use `whatsAppClientService.getClient(sessionId)` instead of accessing repository directly
- **Don't forget .bind(controller)** - Route handlers must bind controller context: `.bind(clientController)`
- **Don't hardcode sessionId** - Session ID must always come from route params or request body
- **Path aliases don't work at runtime** - TypeScript compiles them to relative paths. Use npm run build to test production code.
