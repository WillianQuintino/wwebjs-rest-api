# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Run development server:**
```bash
pnpm run dev
```
Uses tsx watch mode for hot reloading.

**Build for production:**
```bash
pnpm run build
```
Compiles TypeScript to `dist/` directory.

**Start production server:**
```bash
pnpm start
```

**Linting and formatting:**
```bash
pnpm run lint
pnpm run format
```

**Testing:**
```bash
pnpm test                 # Run all tests
pnpm run test:watch       # Run tests in watch mode
pnpm run test:coverage    # Generate coverage report
pnpm run test:manual      # Run interactive manual tests
```

**Docker:**
```bash
docker-compose up -d      # Start containers
docker-compose down       # Stop containers
docker-compose logs -f    # View logs
docker-compose ps         # Check status
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

**IMPORTANT: Every new route MUST have Swagger documentation created.**

**To add a new WhatsApp operation:**

1. Add DTO interface in `src/models/I{Domain}.ts`
2. Add method to appropriate service in `src/services/{Domain}Service.ts`
3. Add controller method in `src/controllers/{Domain}Controller.ts`
4. Add route in `src/routes/index.ts`
5. Export new types in `src/models/index.ts`
6. **Add Swagger documentation** in `src/docs/swagger/en/{domain}.yaml` (English)
7. **Add Swagger documentation** in `src/docs/swagger/pt/{domain}.yaml` (Portuguese)
8. **Add DTO schema** in `src/config/swagger-en.ts` and `src/config/swagger-pt.ts` (if needed)

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

5. `src/docs/swagger/en/messages.yaml`:
```yaml
/sessions/{sessionId}/messages/star:
  post:
    tags:
      - 💬 Messages
    summary: Star message
    description: Star or unstar a message
    parameters:
      - name: sessionId
        in: path
        required: true
        schema:
          type: string
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/StarMessageDTO'
    responses:
      200:
        description: Message starred successfully
```

6. `src/docs/swagger/pt/messages.yaml`:
```yaml
/sessions/{sessionId}/messages/star:
  post:
    tags:
      - 💬 Mensagens
    summary: Favoritar mensagem
    description: Favorita ou desfavorita uma mensagem
    parameters:
      - name: sessionId
        in: path
        required: true
        schema:
          type: string
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/StarMessageDTO'
    responses:
      200:
        description: Mensagem favoritada com sucesso
```

7. `src/config/swagger-en.ts` and `src/config/swagger-pt.ts`:
```typescript
// Add to schemas:
StarMessageDTO: {
  type: 'object',
  required: ['chatId', 'messageId', 'star'],
  properties: {
    chatId: { type: 'string', example: '5511999999999@c.us' },
    messageId: { type: 'string' },
    star: { type: 'boolean', description: 'true to star, false to unstar' }
  }
}
```

## Swagger Documentation

**Access Documentation:**
- **English**: http://localhost:3000/api-docs
- **Portuguese**: http://localhost:3000/api-docs/br

**Documentation Structure:**
- All documentation is in YAML files under `src/docs/swagger/en/` and `src/docs/swagger/pt/`
- Schemas are defined in `src/config/swagger-en.ts` and `src/config/swagger-pt.ts`
- Documentation is kept separate from code to avoid pollution
- Both EN and PT versions must be maintained for every endpoint

**Coverage:**
- ✅ Session Management (10 endpoints)
- ✅ Messages (10 endpoints)
- ✅ Chats (11 endpoints)
- ✅ Groups (12 endpoints)
- ✅ Contacts (10 endpoints)
- ✅ Profile (5 endpoints)

See `README-SWAGGER.md` for detailed documentation guide.

## Testing the API

Use examples from `EXAMPLES.md`. Basic flow:

1. Initialize session: `POST /api/v1/sessions/my-session/init`
2. Scan QR code from response
3. Check status: `GET /api/v1/sessions/my-session` (wait for `READY`)
4. Send message: `POST /api/v1/sessions/my-session/messages/send`

Or use Swagger UI at http://localhost:3000/api-docs to test directly.

## Documentation Guidelines

**IMPORTANT: This project keeps code clean by separating documentation**

### API Documentation (Swagger)
- **Location**: `src/docs/swagger/en/*.yaml` and `src/docs/swagger/pt/*.yaml`
- **Purpose**: Document REST API endpoints for external consumers
- **Languages**: English and Portuguese (both required)
- **Access**: http://localhost:3000/api-docs (EN) | http://localhost:3000/api-docs/br (PT)

### Internal Code Documentation
- **Location**: `docs/internal/*.md`
- **Purpose**: Document internal functions, services, utilities for developers
- **Format**: Clear Markdown with examples
- **NO CODE POLLUTION**: Never add documentation comments in TypeScript files

### When Adding New Code

**For API Endpoints (Public)**:
1. Write clean code in controllers (NO comments)
2. Document in `src/docs/swagger/en/[domain].yaml`
3. Document in `src/docs/swagger/pt/[domain].yaml`
4. Add schemas to `src/config/swagger-en.ts` and `src/config/swagger-pt.ts`

**For Internal Functions (Private)**:
1. Write clean code (NO comments)
2. Document in `docs/internal/SERVICES.md` (or UTILS.md, MODELS.md)
3. Include: file path, description, parameters, return value, examples

**Example Internal Documentation**:
```markdown
### `functionName(param1, param2)`

**File**: `src/services/MyService.ts:45`

**What it does**: Brief clear description

**When to use**: Specific use cases

**Parameters**:
- `param1` (type): Description
- `param2` (type): Description

**Returns**: `ReturnType` - Description

**Example**:
\`\`\`typescript
const result = await service.functionName('value', 123);
\`\`\`
```

## Testing Guidelines

**IMPORTANT: Every new feature MUST have tests**

### Test Structure

```
tests/
├── unit/                    # Unit tests (isolated components)
├── integration/             # Integration tests (API endpoints)
├── manual/                  # Manual interactive tests
└── setup.ts                 # Global test configuration
```

### Creating Tests for New Features

When adding a new feature, create tests in this order:

#### 1. Unit Tests (`tests/unit/`)

Test isolated functions and classes:

```typescript
// tests/unit/MyService.test.ts
import { MyService } from '@services/MyService';

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    service = MyService.getInstance();
  });

  describe('myMethod', () => {
    it('should return expected value', () => {
      const result = service.myMethod('input');
      expect(result).toBe('expected');
    });

    it('should throw error for invalid input', () => {
      expect(() => service.myMethod('')).toThrow();
    });
  });
});
```

**What to test:**
- Service methods (business logic)
- Validators (input validation)
- Formatters (data transformation)
- Utilities (helper functions)
- Error handling

#### 2. Integration Tests (`tests/integration/`)

Test API endpoints and complete flows:

```typescript
// tests/integration/myFeature.test.ts
import request from 'supertest';
import { App } from '@config/app';

describe('My Feature API', () => {
  let app: any;
  const testSessionId = 'test-session-' + Date.now();

  beforeAll(() => {
    const appInstance = new App();
    app = appInstance.getApp();
  });

  describe('POST /api/v1/my-endpoint', () => {
    it('should create resource successfully', async () => {
      const response = await request(app)
        .post(`/api/v1/sessions/${testSessionId}/my-endpoint`)
        .send({ data: 'value' })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
    });

    it('should return validation error', async () => {
      const response = await request(app)
        .post(`/api/v1/sessions/${testSessionId}/my-endpoint`)
        .send({ invalid: 'data' })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error.code).toBe('BAD_REQUEST');
    });
  });
});
```

**What to test:**
- HTTP status codes
- Response structure
- Request validation
- Error responses
- Authentication flows
- Complete user journeys

#### 3. Manual Tests (`tests/manual/`)

For features requiring human interaction:

```typescript
// tests/manual/my-feature-tester.ts
async function testMyFeature() {
  console.log('🧪 Testing My Feature');

  // 1. Setup
  const session = await initializeSession();

  // 2. User interaction
  await waitForUserInput('Please complete action X');

  // 3. Verification
  const result = await verifyFeature(session);

  console.log(result ? '✅ Test passed' : '❌ Test failed');
}
```

**When to use:**
- QR code authentication flows
- Real WhatsApp interactions
- Features requiring phone verification
- Complex multi-step workflows

### Test Configuration

**Jest Setup** (`jest.config.js`):
- Timeout: 30000ms (WhatsApp operations can be slow)
- Test environment: node
- Path aliases: Same as tsconfig.json
- Coverage: src/**/*.ts (excluding .d.ts and server.ts)

**Global Setup** (`tests/setup.ts`):
- Mock logger to avoid console pollution
- Clear mocks after each test
- Global timeout configuration

### Running Tests

```bash
# All tests
pnpm test

# Specific test file
pnpm test -- SessionRepository.test.ts

# Watch mode (development)
pnpm run test:watch

# Coverage report
pnpm run test:coverage

# Manual interactive tests
pnpm run test:manual
```

### Test Coverage Standards

**Minimum coverage requirements:**
- Overall: 80%
- Critical paths: 100%
- Services: 90%
- Controllers: 85%
- Utils/Validators: 95%

### Testing Best Practices

✅ **Do:**
- Test one thing per test case
- Use descriptive test names
- Mock external dependencies
- Test both success and error cases
- Keep tests independent
- Use beforeEach/afterEach for cleanup
- Test edge cases

❌ **Don't:**
- Test implementation details
- Create interdependent tests
- Use real WhatsApp sessions in unit tests
- Skip error case testing
- Hardcode test data
- Leave console.log statements

### Example: Complete Test Suite for New Feature

When adding "star message" feature:

**1. Unit Test** (`tests/unit/MessageService.test.ts`):
```typescript
describe('MessageService.starMessage', () => {
  it('should star message successfully', async () => {
    // Test isolated business logic
  });

  it('should throw error for invalid messageId', async () => {
    // Test error handling
  });
});
```

**2. Integration Test** (`tests/integration/messages.test.ts`):
```typescript
describe('POST /sessions/:sessionId/messages/star', () => {
  it('should star message via API', async () => {
    const response = await request(app)
      .post(`/api/v1/sessions/${sessionId}/messages/star`)
      .send({ chatId: 'test@c.us', messageId: 'msg123', star: true })
      .expect(200);
  });
});
```

**3. Manual Test** (if needed):
```bash
# Test with real WhatsApp session
pnpm run test:manual
# Follow prompts to test starring messages
```

### Continuous Integration

Tests run automatically:
- Before commits (pre-commit hook)
- On pull requests
- Before deployment

Ensure all tests pass before pushing code.

## Docker Deployment

**IMPORTANT: This project is fully containerized with Docker**

### Docker Files

- **Dockerfile**: Multi-stage build for optimized production image
- **docker-compose.yml**: Complete orchestration with volumes and networking
- **.dockerignore**: Excludes unnecessary files from image
- **.env.docker**: Environment template for Docker deployment

### Docker Architecture

**Multi-stage Build:**
1. **Builder stage**: Installs dependencies, builds TypeScript
2. **Production stage**: Minimal image with only runtime dependencies

**Features:**
- ✅ Alpine Linux base (small size)
- ✅ Chromium pre-installed for Puppeteer
- ✅ Non-root user (`nodejs`)
- ✅ Health checks
- ✅ Persistent volumes for sessions/logs/uploads
- ✅ Resource limits (CPU/Memory)
- ✅ Security hardening (capabilities, no-new-privileges)

### Quick Start

```bash
# Copy environment file
cp .env.docker .env

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Check health
docker-compose ps
```

### Volumes

Three persistent volumes are automatically created:

1. **whatsapp-sessions**: WhatsApp authentication data (CRITICAL)
2. **whatsapp-logs**: Application logs
3. **whatsapp-uploads**: Uploaded media files

**IMPORTANT**: Never delete `whatsapp-sessions` volume or you'll lose all authenticated sessions.

### Environment Variables

Configure in `.env` file (see `.env.docker` for template):

```env
PORT=3000
NODE_ENV=production
PUPPETEER_HEADLESS=true
API_KEY=your-secret-key
ALLOWED_ORIGINS=http://localhost:3000
```

### Building Custom Images

When modifying code:

```bash
# Rebuild image
docker-compose build

# Or rebuild and restart in one command
docker-compose up -d --build

# Force rebuild without cache
docker-compose build --no-cache
```

### Production Deployment

**Best practices for production:**

1. **Security:**
   - Generate strong API_KEY: `openssl rand -hex 32`
   - Use HTTPS reverse proxy (Nginx/Traefik)
   - Restrict ALLOWED_ORIGINS
   - Keep Docker/packages updated

2. **Monitoring:**
   - Configure log rotation in docker-compose.yml
   - Monitor resource usage: `docker stats whatsapp-api`
   - Set up alerts for container health

3. **Backups:**
   - Backup whatsapp-sessions volume regularly
   - Use automated backup scripts
   - Test restore procedures

4. **Updates:**
   ```bash
   git pull origin master
   docker-compose up -d --build
   docker image prune -f
   ```

### Troubleshooting Docker

**Container won't start:**
```bash
docker-compose logs whatsapp-api
docker-compose config  # Validate configuration
```

**Chromium/Puppeteer issues:**
```bash
# Check Chromium installation
docker-compose exec whatsapp-api chromium-browser --version

# Test Puppeteer
docker-compose exec whatsapp-api node -e "require('puppeteer').launch().then(() => console.log('OK'))"
```

**Sessions not persisting:**
```bash
# Verify volume is mounted
docker-compose exec whatsapp-api ls -la /app/sessions

# Check volume exists
docker volume inspect whatsapp-sessions
```

**High memory usage:**
```bash
# Monitor resources
docker stats whatsapp-api

# Adjust limits in docker-compose.yml:
deploy:
  resources:
    limits:
      memory: 2G  # Increase if needed
```

### Development with Docker

For development, you can mount source code:

```yaml
# Add to docker-compose.yml services.whatsapp-api
volumes:
  - ./src:/app/src  # Mount source for live updates
```

Or use development compose file:

```bash
docker-compose -f docker-compose.dev.yml up
```

## Common Pitfalls

- **Don't instantiate services directly** - Always use singleton instances exported from service files
- **Don't bypass getClient()** - Always use `whatsAppClientService.getClient(sessionId)` instead of accessing repository directly
- **Don't forget .bind(controller)** - Route handlers must bind controller context: `.bind(clientController)`
- **Don't hardcode sessionId** - Session ID must always come from route params or request body
- **Path aliases don't work at runtime** - TypeScript compiles them to relative paths. Use pnpm run build to test production code
- **Don't add documentation in code** - Use separate YAML (API) or Markdown (internal) files
- **Don't document only in English** - Always update both EN and PT Swagger docs
- **Don't skip tests** - Every new feature must have unit and integration tests
- **Don't use real sessions in automated tests** - Use mocks for WhatsApp client in unit tests
