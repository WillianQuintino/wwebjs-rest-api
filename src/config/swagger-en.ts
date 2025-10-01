import swaggerJsdoc from 'swagger-jsdoc';
import { version, description } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🚀 WhatsApp Web.js REST API',
      version,
      description: `${description}

## Quick Start
1. **Init**: POST \`/sessions/{id}/init\`
2. **QR Code**: GET \`/sessions/{id}/qr/image\`
3. **Scan**: Use WhatsApp app
4. **Status**: GET \`/sessions/{id}\` (wait "READY")
5. **Send**: POST \`/sessions/{id}/messages/send\`

**Flow**: INITIALIZING → QR_CODE → AUTHENTICATING → READY`,
      contact: {
        name: 'Willian Quintino',
        url: 'https://github.com/WillianQuintino',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server'
      },
      {
        url: 'https://your-domain.com/api/v1',
        description: 'Production server'
      }
    ],
    tags: [
      { name: '🔐 Session Management', description: 'Initialize and manage WhatsApp sessions' },
      { name: '📱 QR Code Access', description: 'Access QR codes in multiple formats' },
      { name: '💬 Messages', description: 'Send and manage messages' },
      { name: '📊 Chats', description: 'Manage conversations' },
      { name: '👥 Groups', description: 'Create and manage groups' },
      { name: '📞 Contacts', description: 'Manage contacts' },
      { name: '🎭 Profile', description: 'Manage profile settings' },
      { name: '🔍 Session Diagnostics', description: 'Advanced session monitoring' }
    ],
    components: {
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' }
              }
            },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        SessionStatus: {
          type: 'string',
          enum: ['INITIALIZING', 'QR_CODE', 'AUTHENTICATING', 'READY', 'DISCONNECTED', 'ERROR']
        },
        SendMessageDTO: {
          type: 'object',
          required: ['chatId', 'content'],
          properties: {
            chatId: { type: 'string', example: '5511999999999@c.us' },
            content: { type: 'string', example: 'Hello, WhatsApp!' },
            options: { $ref: '#/components/schemas/SendMessageOptions' }
          }
        },
        SendMessageOptions: {
          type: 'object',
          properties: {
            quotedMessageId: { type: 'string' },
            mentions: { type: 'array', items: { type: 'string' } },
            linkPreview: { type: 'boolean', default: true }
          }
        },
        SendMediaDTO: {
          type: 'object',
          required: ['chatId', 'media'],
          properties: {
            chatId: { type: 'string', example: '5511999999999@c.us' },
            media: { $ref: '#/components/schemas/MediaData' },
            options: { $ref: '#/components/schemas/SendMessageOptions' }
          }
        },
        MediaData: {
          type: 'object',
          required: ['mimetype', 'data'],
          properties: {
            mimetype: { type: 'string', example: 'image/jpeg' },
            data: { type: 'string', format: 'base64' },
            filename: { type: 'string', example: 'photo.jpg' }
          }
        },
        SendLocationDTO: {
          type: 'object',
          required: ['chatId', 'latitude', 'longitude'],
          properties: {
            chatId: { type: 'string', example: '5511999999999@c.us' },
            latitude: { type: 'number', format: 'double', example: -23.550520 },
            longitude: { type: 'number', format: 'double', example: -46.633308 },
            name: { type: 'string', example: 'São Paulo Cathedral' },
            address: { type: 'string', example: 'Praça da Sé - Sé, São Paulo - SP' }
          }
        },
        SendPollDTO: {
          type: 'object',
          required: ['chatId', 'question', 'options'],
          properties: {
            chatId: { type: 'string', example: '5511999999999@c.us' },
            question: { type: 'string', example: 'What is your favorite programming language?' },
            options: { type: 'array', items: { type: 'string' }, example: ['JavaScript', 'Python', 'TypeScript', 'Go'] },
            allowMultipleAnswers: { type: 'boolean', default: false }
          }
        },
        ReactToMessageDTO: {
          type: 'object',
          required: ['messageId', 'chatId', 'emoji'],
          properties: {
            messageId: { type: 'string' },
            chatId: { type: 'string', example: '5511999999999@c.us' },
            emoji: { type: 'string', example: '👍' }
          }
        },
        ForwardMessageDTO: {
          type: 'object',
          required: ['messageId', 'sourceChatId', 'targetChatId'],
          properties: {
            messageId: { type: 'string' },
            sourceChatId: { type: 'string', example: '5511999999999@c.us' },
            targetChatId: { type: 'string', example: '5511888888888@c.us' }
          }
        },
        DeleteMessageDTO: {
          type: 'object',
          required: ['messageId', 'chatId', 'deleteForEveryone'],
          properties: {
            messageId: { type: 'string' },
            chatId: { type: 'string', example: '5511999999999@c.us' },
            deleteForEveryone: { type: 'boolean', default: false }
          }
        },
        EditMessageDTO: {
          type: 'object',
          required: ['messageId', 'chatId', 'newContent'],
          properties: {
            messageId: { type: 'string' },
            chatId: { type: 'string', example: '5511999999999@c.us' },
            newContent: { type: 'string', example: 'Updated message text' }
          }
        },
        SearchMessagesDTO: {
          type: 'object',
          required: ['query'],
          properties: {
            query: { type: 'string', example: 'hello' },
            chatId: { type: 'string' },
            limit: { type: 'number', default: 50 }
          }
        },
        ChatResponse: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            isGroup: { type: 'boolean' },
            isReadOnly: { type: 'boolean' },
            unreadCount: { type: 'number' },
            timestamp: { type: 'number' },
            archived: { type: 'boolean' },
            pinned: { type: 'boolean' },
            isMuted: { type: 'boolean' }
          }
        },
        ArchiveChatDTO: {
          type: 'object',
          required: ['chatId', 'archive'],
          properties: {
            chatId: { type: 'string', example: '5511999999999@c.us' },
            archive: { type: 'boolean' }
          }
        },
        PinChatDTO: {
          type: 'object',
          required: ['chatId', 'pin'],
          properties: {
            chatId: { type: 'string', example: '5511999999999@c.us' },
            pin: { type: 'boolean' }
          }
        },
        MuteChatDTO: {
          type: 'object',
          required: ['chatId', 'mute'],
          properties: {
            chatId: { type: 'string', example: '5511999999999@c.us' },
            mute: { type: 'boolean' },
            duration: { type: 'number' }
          }
        },
        CreateGroupDTO: {
          type: 'object',
          required: ['name', 'participantIds'],
          properties: {
            name: { type: 'string', example: 'My WhatsApp Group' },
            participantIds: { type: 'array', items: { type: 'string' }, example: ['5511999999999@c.us', '5511888888888@c.us'] }
          }
        },
        AddParticipantsDTO: {
          type: 'object',
          required: ['groupId', 'participantIds'],
          properties: {
            groupId: { type: 'string', example: '123456789@g.us' },
            participantIds: { type: 'array', items: { type: 'string' } }
          }
        },
        UpdateGroupSubjectDTO: {
          type: 'object',
          required: ['groupId', 'subject'],
          properties: {
            groupId: { type: 'string', example: '123456789@g.us' },
            subject: { type: 'string', example: 'New Group Name' }
          }
        },
        UpdateGroupDescriptionDTO: {
          type: 'object',
          required: ['groupId', 'description'],
          properties: {
            groupId: { type: 'string', example: '123456789@g.us' },
            description: { type: 'string', example: 'This is a group description' }
          }
        },
        AcceptInviteDTO: {
          type: 'object',
          required: ['inviteCode'],
          properties: {
            inviteCode: { type: 'string', example: 'ABC123DEF456' }
          }
        },
        ContactResponse: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            pushname: { type: 'string' },
            number: { type: 'string' },
            isBusiness: { type: 'boolean' },
            isMyContact: { type: 'boolean' },
            isBlocked: { type: 'boolean' }
          }
        },
        ValidateNumberDTO: {
          type: 'object',
          required: ['number'],
          properties: {
            number: { type: 'string', example: '5511999999999' }
          }
        },
        SaveContactDTO: {
          type: 'object',
          required: ['phoneNumber', 'firstName'],
          properties: {
            phoneNumber: { type: 'string', example: '5511999999999' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' }
          }
        },
        SetProfileNameDTO: {
          type: 'object',
          required: ['displayName'],
          properties: {
            displayName: { type: 'string', example: 'My New Name' }
          }
        },
        SetProfileStatusDTO: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', example: 'Available' }
          }
        },
        SetProfilePictureDTO: {
          type: 'object',
          required: ['media'],
          properties: {
            media: { $ref: '#/components/schemas/MediaData' }
          }
        }
      }
    }
  },
  apis: [
    './src/docs/swagger/en/*.yaml'
  ],
};

const swaggerSpecEN = swaggerJsdoc(options);

export default swaggerSpecEN;
