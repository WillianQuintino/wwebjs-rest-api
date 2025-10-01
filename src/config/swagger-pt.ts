import swaggerJsdoc from 'swagger-jsdoc';
import { version, description } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🚀 API REST WhatsApp Web.js',
      version,
      description: `${description}

## Início Rápido
1. **Iniciar**: POST \`/sessions/{id}/init\`
2. **QR Code**: GET \`/sessions/{id}/qr/image\`
3. **Escanear**: Use o app WhatsApp
4. **Status**: GET \`/sessions/{id}\` (aguarde "READY")
5. **Enviar**: POST \`/sessions/{id}/messages/send\`

**Fluxo**: INITIALIZING → QR_CODE → AUTHENTICATING → READY`,
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
        description: 'Servidor de desenvolvimento'
      },
      {
        url: 'https://seu-dominio.com/api/v1',
        description: 'Servidor de produção'
      }
    ],
    tags: [
      { name: '🔐 Gerenciamento de Sessão', description: 'Inicializar e gerenciar sessões do WhatsApp' },
      { name: '📱 Acesso ao QR Code', description: 'Acessar QR codes em múltiplos formatos' },
      { name: '💬 Mensagens', description: 'Enviar e gerenciar mensagens' },
      { name: '📊 Conversas', description: 'Gerenciar conversas' },
      { name: '👥 Grupos', description: 'Criar e gerenciar grupos' },
      { name: '📞 Contatos', description: 'Gerenciar contatos' },
      { name: '🎭 Perfil', description: 'Gerenciar configurações de perfil' },
      { name: '🔍 Diagnóstico de Sessão', description: 'Monitoramento avançado de sessões' }
    ],
    components: {
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', description: 'Indica se a requisição foi bem-sucedida' },
            data: { type: 'object', description: 'Dados da resposta' },
            message: { type: 'string', description: 'Mensagem de resposta' },
            timestamp: { type: 'string', format: 'date-time', description: 'Data/hora ISO' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', description: 'Mensagem de erro' },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', description: 'Código do erro' },
                message: { type: 'string', description: 'Mensagem detalhada do erro' }
              }
            },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        SessionStatus: {
          type: 'string',
          enum: ['INITIALIZING', 'QR_CODE', 'AUTHENTICATING', 'READY', 'DISCONNECTED', 'ERROR'],
          description: 'Status atual da sessão no fluxo de autenticação'
        },
        SendMessageDTO: {
          type: 'object',
          required: ['chatId', 'content'],
          properties: {
            chatId: { type: 'string', description: 'ID do chat', example: '5511999999999@c.us' },
            content: { type: 'string', description: 'Texto da mensagem', example: 'Olá, WhatsApp!' },
            options: { $ref: '#/components/schemas/SendMessageOptions' }
          }
        },
        SendMessageOptions: {
          type: 'object',
          properties: {
            quotedMessageId: { type: 'string', description: 'ID da mensagem para responder' },
            mentions: { type: 'array', items: { type: 'string' }, description: 'IDs de contatos para mencionar' },
            linkPreview: { type: 'boolean', description: 'Ativar/desativar preview de link', default: true }
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
            mimetype: { type: 'string', description: 'Tipo MIME do arquivo', example: 'image/jpeg' },
            data: { type: 'string', format: 'base64', description: 'Dados do arquivo em base64' },
            filename: { type: 'string', description: 'Nome do arquivo opcional', example: 'foto.jpg' }
          }
        },
        SendLocationDTO: {
          type: 'object',
          required: ['chatId', 'latitude', 'longitude'],
          properties: {
            chatId: { type: 'string', example: '5511999999999@c.us' },
            latitude: { type: 'number', format: 'double', example: -23.550520 },
            longitude: { type: 'number', format: 'double', example: -46.633308 },
            name: { type: 'string', example: 'Catedral da Sé' },
            address: { type: 'string', example: 'Praça da Sé - Sé, São Paulo - SP' }
          }
        },
        SendPollDTO: {
          type: 'object',
          required: ['chatId', 'question', 'options'],
          properties: {
            chatId: { type: 'string', example: '5511999999999@c.us' },
            question: { type: 'string', example: 'Qual sua linguagem de programação favorita?' },
            options: { type: 'array', items: { type: 'string' }, example: ['JavaScript', 'Python', 'TypeScript', 'Go'] },
            allowMultipleAnswers: { type: 'boolean', description: 'Permitir múltiplas respostas', default: false }
          }
        },
        ReactToMessageDTO: {
          type: 'object',
          required: ['messageId', 'chatId', 'emoji'],
          properties: {
            messageId: { type: 'string', description: 'ID da mensagem para reagir' },
            chatId: { type: 'string', example: '5511999999999@c.us' },
            emoji: { type: 'string', description: 'Emoji para reagir', example: '👍' }
          }
        },
        ForwardMessageDTO: {
          type: 'object',
          required: ['messageId', 'sourceChatId', 'targetChatId'],
          properties: {
            messageId: { type: 'string' },
            sourceChatId: { type: 'string', description: 'Chat de origem', example: '5511999999999@c.us' },
            targetChatId: { type: 'string', description: 'Chat de destino', example: '5511888888888@c.us' }
          }
        },
        DeleteMessageDTO: {
          type: 'object',
          required: ['messageId', 'chatId', 'deleteForEveryone'],
          properties: {
            messageId: { type: 'string' },
            chatId: { type: 'string', example: '5511999999999@c.us' },
            deleteForEveryone: { type: 'boolean', description: 'Deletar para todos ou só para mim', default: false }
          }
        },
        EditMessageDTO: {
          type: 'object',
          required: ['messageId', 'chatId', 'newContent'],
          properties: {
            messageId: { type: 'string' },
            chatId: { type: 'string', example: '5511999999999@c.us' },
            newContent: { type: 'string', description: 'Novo texto da mensagem', example: 'Texto atualizado' }
          }
        },
        SearchMessagesDTO: {
          type: 'object',
          required: ['query'],
          properties: {
            query: { type: 'string', description: 'Texto de busca', example: 'olá' },
            chatId: { type: 'string', description: 'Opcional: limitar busca a um chat específico' },
            limit: { type: 'number', description: 'Limite de resultados', default: 50 }
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
            archive: { type: 'boolean', description: 'true para arquivar, false para desarquivar' }
          }
        },
        PinChatDTO: {
          type: 'object',
          required: ['chatId', 'pin'],
          properties: {
            chatId: { type: 'string', example: '5511999999999@c.us' },
            pin: { type: 'boolean', description: 'true para fixar, false para desafixar' }
          }
        },
        MuteChatDTO: {
          type: 'object',
          required: ['chatId', 'mute'],
          properties: {
            chatId: { type: 'string', example: '5511999999999@c.us' },
            mute: { type: 'boolean', description: 'true para silenciar, false para ativar' },
            duration: { type: 'number', description: 'Duração em segundos (apenas ao silenciar)' }
          }
        },
        CreateGroupDTO: {
          type: 'object',
          required: ['name', 'participantIds'],
          properties: {
            name: { type: 'string', example: 'Meu Grupo WhatsApp' },
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
            subject: { type: 'string', description: 'Novo nome do grupo', example: 'Novo Nome do Grupo' }
          }
        },
        UpdateGroupDescriptionDTO: {
          type: 'object',
          required: ['groupId', 'description'],
          properties: {
            groupId: { type: 'string', example: '123456789@g.us' },
            description: { type: 'string', example: 'Esta é uma descrição do grupo' }
          }
        },
        AcceptInviteDTO: {
          type: 'object',
          required: ['inviteCode'],
          properties: {
            inviteCode: { type: 'string', description: 'Código de convite do grupo WhatsApp', example: 'ABC123DEF456' }
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
            number: { type: 'string', description: 'Número de telefone para validar', example: '5511999999999' }
          }
        },
        SaveContactDTO: {
          type: 'object',
          required: ['phoneNumber', 'firstName'],
          properties: {
            phoneNumber: { type: 'string', example: '5511999999999' },
            firstName: { type: 'string', example: 'João' },
            lastName: { type: 'string', example: 'Silva' }
          }
        },
        SetProfileNameDTO: {
          type: 'object',
          required: ['displayName'],
          properties: {
            displayName: { type: 'string', example: 'Meu Novo Nome' }
          }
        },
        SetProfileStatusDTO: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', example: 'Disponível' }
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
    './src/docs/swagger/pt/*.yaml'
  ],
};

const swaggerSpecPT = swaggerJsdoc(options);

export default swaggerSpecPT;
