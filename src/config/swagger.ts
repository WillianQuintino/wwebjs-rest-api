import swaggerJsdoc from 'swagger-jsdoc';
import { name, version, description } from '../../package.json';

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
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
