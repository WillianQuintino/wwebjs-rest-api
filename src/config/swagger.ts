import swaggerJsdoc from 'swagger-jsdoc';
import { version, description } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🚀 WhatsApp Web.js REST API',
      version,
      description: `
${description}

## 📋 Quick Start Guide

### 1. Initialize Session
\`POST /api/v1/sessions/{sessionId}/init\`

### 2. Get QR Code
- **PNG Image**: \`GET /api/v1/sessions/{sessionId}/qr/image\`
- **SVG Scalable**: \`GET /api/v1/sessions/{sessionId}/qr/svg\`
- **ASCII Terminal**: \`GET /api/v1/sessions/{sessionId}/qr/ascii\`

### 3. Scan QR Code
Use WhatsApp mobile app to scan the QR code

### 4. Check Status
\`GET /api/v1/sessions/{sessionId}\` until status becomes "READY"

### 5. Send Messages
\`POST /api/v1/sessions/{sessionId}/messages/send\`

## 🔐 Authentication Flow
\`INITIALIZING\` → \`QR_CODE\` → \`AUTHENTICATING\` → \`READY\`

## 📱 QR Code Formats
- **PNG**: Traditional bitmap for <img> tags
- **SVG**: Scalable vector for responsive design  
- **ASCII**: Text format for terminals and logs

## ⚡ Rate Limits
WhatsApp enforces rate limits. Please send messages responsibly.

## 🛡️ Security Notes
- Use HTTPS in production
- Secure your API endpoints
- Monitor session status regularly
- Handle disconnections gracefully
      `,
      contact: {
        name: 'Willian Quintino',
        url: 'https://github.com/WillianQuintino',
        email: 'willian.quintino@example.com'
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
      {
        name: '🔐 Session Management',
        description: 'Initialize, manage and monitor WhatsApp Web sessions'
      },
      {
        name: '📱 QR Code Access',
        description: 'Access QR codes in multiple formats (PNG, SVG, ASCII)'
      },
      {
        name: '💬 Messages',
        description: 'Send and manage WhatsApp messages'
      },
      {
        name: '👥 Groups',
        description: 'Create and manage WhatsApp groups'
      },
      {
        name: '📞 Contacts',
        description: 'Manage WhatsApp contacts and validation'
      },
      {
        name: '📊 Chats',
        description: 'Manage WhatsApp conversations'
      },
      {
        name: '🎭 Profile',
        description: 'Manage WhatsApp profile settings'
      },
      {
        name: '🔍 Session Diagnostics',
        description: 'Advanced session monitoring and diagnostics'
      }
    ],
    components: {
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if the request was successful'
            },
            data: {
              type: 'object',
              description: 'Response data (varies by endpoint)'
            },
            message: {
              type: 'string',
              description: 'Human-readable response message'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'ISO timestamp of the response'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: 'Error code'
                },
                message: {
                  type: 'string',
                  description: 'Detailed error message'
                }
              }
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        SessionStatus: {
          type: 'string',
          enum: ['INITIALIZING', 'QR_CODE', 'AUTHENTICATING', 'READY', 'DISCONNECTED', 'ERROR'],
          description: 'Current session status in the authentication flow'
        },
        SendMessageDTO: {
          type: 'object',
          required: ['chatId', 'content'],
          properties: {
            chatId: {
              type: 'string',
              description: 'Chat ID (5511999999999@c.us for individual, 123456789@g.us for group)',
              example: '5511999999999@c.us'
            },
            content: {
              type: 'string',
              description: 'Message text content',
              example: 'Hello, WhatsApp!'
            },
            options: {
              $ref: '#/components/schemas/SendMessageOptions'
            }
          }
        },
        SendMessageOptions: {
          type: 'object',
          properties: {
            quotedMessageId: {
              type: 'string',
              description: 'ID of message to quote/reply'
            },
            mentions: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of contact IDs to mention'
            },
            linkPreview: {
              type: 'boolean',
              description: 'Enable/disable link preview',
              default: true
            }
          }
        },
        SendMediaDTO: {
          type: 'object',
          required: ['chatId', 'media'],
          properties: {
            chatId: {
              type: 'string',
              example: '5511999999999@c.us'
            },
            media: {
              $ref: '#/components/schemas/MediaData'
            },
            options: {
              $ref: '#/components/schemas/SendMessageOptions'
            }
          }
        },
        MediaData: {
          type: 'object',
          required: ['mimetype', 'data'],
          properties: {
            mimetype: {
              type: 'string',
              description: 'MIME type of the file',
              example: 'image/jpeg'
            },
            data: {
              type: 'string',
              format: 'base64',
              description: 'Base64-encoded file data'
            },
            filename: {
              type: 'string',
              description: 'Optional filename',
              example: 'photo.jpg'
            }
          }
        },
        SendLocationDTO: {
          type: 'object',
          required: ['chatId', 'latitude', 'longitude'],
          properties: {
            chatId: {
              type: 'string',
              example: '5511999999999@c.us'
            },
            latitude: {
              type: 'number',
              format: 'double',
              example: -23.550520
            },
            longitude: {
              type: 'number',
              format: 'double',
              example: -46.633308
            },
            name: {
              type: 'string',
              example: 'São Paulo Cathedral'
            },
            address: {
              type: 'string',
              example: 'Praça da Sé - Sé, São Paulo - SP'
            }
          }
        },
        SendPollDTO: {
          type: 'object',
          required: ['chatId', 'question', 'options'],
          properties: {
            chatId: {
              type: 'string',
              example: '5511999999999@c.us'
            },
            question: {
              type: 'string',
              example: 'What is your favorite programming language?'
            },
            options: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['JavaScript', 'Python', 'TypeScript', 'Go']
            },
            allowMultipleAnswers: {
              type: 'boolean',
              default: false
            }
          }
        },
        ReactToMessageDTO: {
          type: 'object',
          required: ['messageId', 'chatId', 'emoji'],
          properties: {
            messageId: {
              type: 'string',
              description: 'ID of the message to react to'
            },
            chatId: {
              type: 'string',
              example: '5511999999999@c.us'
            },
            emoji: {
              type: 'string',
              description: 'Emoji to react with',
              example: '👍'
            }
          }
        },
        ForwardMessageDTO: {
          type: 'object',
          required: ['messageId', 'sourceChatId', 'targetChatId'],
          properties: {
            messageId: {
              type: 'string'
            },
            sourceChatId: {
              type: 'string',
              example: '5511999999999@c.us'
            },
            targetChatId: {
              type: 'string',
              example: '5511888888888@c.us'
            }
          }
        },
        DeleteMessageDTO: {
          type: 'object',
          required: ['messageId', 'chatId', 'deleteForEveryone'],
          properties: {
            messageId: {
              type: 'string'
            },
            chatId: {
              type: 'string',
              example: '5511999999999@c.us'
            },
            deleteForEveryone: {
              type: 'boolean',
              description: 'Delete for everyone or just for me',
              default: false
            }
          }
        },
        EditMessageDTO: {
          type: 'object',
          required: ['messageId', 'chatId', 'newContent'],
          properties: {
            messageId: {
              type: 'string'
            },
            chatId: {
              type: 'string',
              example: '5511999999999@c.us'
            },
            newContent: {
              type: 'string',
              example: 'Updated message text'
            }
          }
        },
        SearchMessagesDTO: {
          type: 'object',
          required: ['query'],
          properties: {
            query: {
              type: 'string',
              description: 'Search query text',
              example: 'hello'
            },
            chatId: {
              type: 'string',
              description: 'Optional: limit search to specific chat'
            },
            limit: {
              type: 'number',
              default: 50
            }
          }
        },
        ChatResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string'
            },
            name: {
              type: 'string'
            },
            isGroup: {
              type: 'boolean'
            },
            isReadOnly: {
              type: 'boolean'
            },
            unreadCount: {
              type: 'number'
            },
            timestamp: {
              type: 'number'
            },
            archived: {
              type: 'boolean'
            },
            pinned: {
              type: 'boolean'
            },
            isMuted: {
              type: 'boolean'
            }
          }
        },
        ArchiveChatDTO: {
          type: 'object',
          required: ['chatId', 'archive'],
          properties: {
            chatId: {
              type: 'string',
              example: '5511999999999@c.us'
            },
            archive: {
              type: 'boolean',
              description: 'true to archive, false to unarchive'
            }
          }
        },
        PinChatDTO: {
          type: 'object',
          required: ['chatId', 'pin'],
          properties: {
            chatId: {
              type: 'string',
              example: '5511999999999@c.us'
            },
            pin: {
              type: 'boolean',
              description: 'true to pin, false to unpin'
            }
          }
        },
        MuteChatDTO: {
          type: 'object',
          required: ['chatId', 'mute'],
          properties: {
            chatId: {
              type: 'string',
              example: '5511999999999@c.us'
            },
            mute: {
              type: 'boolean',
              description: 'true to mute, false to unmute'
            },
            duration: {
              type: 'number',
              description: 'Duration in seconds (only when muting)'
            }
          }
        },
        CreateGroupDTO: {
          type: 'object',
          required: ['name', 'participantIds'],
          properties: {
            name: {
              type: 'string',
              example: 'My WhatsApp Group'
            },
            participantIds: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['5511999999999@c.us', '5511888888888@c.us']
            }
          }
        },
        AddParticipantsDTO: {
          type: 'object',
          required: ['groupId', 'participantIds'],
          properties: {
            groupId: {
              type: 'string',
              example: '123456789@g.us'
            },
            participantIds: {
              type: 'array',
              items: {
                type: 'string'
              }
            }
          }
        },
        UpdateGroupSubjectDTO: {
          type: 'object',
          required: ['groupId', 'subject'],
          properties: {
            groupId: {
              type: 'string',
              example: '123456789@g.us'
            },
            subject: {
              type: 'string',
              example: 'New Group Name'
            }
          }
        },
        UpdateGroupDescriptionDTO: {
          type: 'object',
          required: ['groupId', 'description'],
          properties: {
            groupId: {
              type: 'string',
              example: '123456789@g.us'
            },
            description: {
              type: 'string',
              example: 'This is a group description'
            }
          }
        },
        AcceptInviteDTO: {
          type: 'object',
          required: ['inviteCode'],
          properties: {
            inviteCode: {
              type: 'string',
              description: 'WhatsApp group invite code',
              example: 'ABC123DEF456'
            }
          }
        },
        ContactResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string'
            },
            name: {
              type: 'string'
            },
            pushname: {
              type: 'string'
            },
            number: {
              type: 'string'
            },
            isBusiness: {
              type: 'boolean'
            },
            isMyContact: {
              type: 'boolean'
            },
            isBlocked: {
              type: 'boolean'
            }
          }
        },
        ValidateNumberDTO: {
          type: 'object',
          required: ['number'],
          properties: {
            number: {
              type: 'string',
              description: 'Phone number to validate',
              example: '5511999999999'
            }
          }
        },
        SaveContactDTO: {
          type: 'object',
          required: ['phoneNumber', 'firstName'],
          properties: {
            phoneNumber: {
              type: 'string',
              example: '5511999999999'
            },
            firstName: {
              type: 'string',
              example: 'John'
            },
            lastName: {
              type: 'string',
              example: 'Doe'
            }
          }
        },
        SetProfileNameDTO: {
          type: 'object',
          required: ['displayName'],
          properties: {
            displayName: {
              type: 'string',
              example: 'My New Name'
            }
          }
        },
        SetProfileStatusDTO: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              example: 'Available'
            }
          }
        },
        SetProfilePictureDTO: {
          type: 'object',
          required: ['media'],
          properties: {
            media: {
              $ref: '#/components/schemas/MediaData'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
