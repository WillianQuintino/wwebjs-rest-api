# 🚀 WhatsApp Web.js API

> API REST completa para integração com WhatsApp Web usando Node.js, TypeScript, Express e whatsapp-web.js

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-14+-green)](https://nodejs.org/)

## 📋 Índice

- [Sobre](#sobre)
- [Características](#características)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Documentação da API (Swagger)](#-documentação-da-api-swagger)
- [API Endpoints](#api-endpoints)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Tecnologias](#tecnologias)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

## 🎯 Sobre

Esta API fornece uma interface REST completa para interagir com o WhatsApp Web através da biblioteca `whatsapp-web.js`. Foi construída seguindo os princípios de Clean Architecture, SOLID e boas práticas de desenvolvimento.

## ✨ Características

- 🔐 **Múltiplas sessões**: Gerenciamento de múltiplas sessões simultâneas
- 💬 **Mensagens**: Envio de texto, mídia, localização, enquetes
- 👥 **Grupos**: Criação e gerenciamento completo de grupos
- 📱 **Contatos**: Gerenciamento de contatos e validação de números
- 🎨 **Perfil**: Customização de perfil (nome, status, foto)
- 📊 **Chats**: Gerenciamento de conversas (arquivar, fixar, silenciar)
- 🔄 **Eventos em tempo real**: WebSocket para eventos do WhatsApp
- 🛡️ **Segurança**: Helmet, CORS, validações
- 📝 **Logs**: Sistema de logging com Winston
- 🎯 **TypeScript**: Tipagem forte em todo o projeto
- 🏗️ **Clean Architecture**: Separação de responsabilidades
- ✅ **SOLID**: Princípios de design aplicados

## 🏛️ Arquitetura

O projeto segue a arquitetura em camadas (Clean Architecture):

```
src/
├── config/          # Configurações (env, logger, whatsapp)
├── models/          # Interfaces e tipos TypeScript
├── repositories/    # Camada de acesso a dados
├── services/        # Lógica de negócio
├── controllers/     # Controladores (handlers de requisição)
├── routes/          # Definição de rotas
├── middlewares/     # Middlewares (error handler, async handler)
├── utils/           # Utilitários (validators, formatters, errors)
├── app.ts           # Configuração do Express
└── server.ts        # Inicialização do servidor
```

### Princípios aplicados:

- **Single Responsibility**: Cada classe tem uma única responsabilidade
- **Open/Closed**: Extensível sem modificar código existente
- **Liskov Substitution**: Interfaces bem definidas
- **Interface Segregation**: Interfaces específicas e coesas
- **Dependency Inversion**: Dependências por abstração

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/api-wwebjs.git

# Entre na pasta
cd api-wwebjs

# Instale as dependências
npm install
```

## ⚙️ Configuração

1. Copie o arquivo de exemplo de variáveis de ambiente:

```bash
cp .env.example .env
```

2. Configure as variáveis de ambiente no arquivo `.env`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# API Configuration
API_PREFIX=/api
API_VERSION=v1

# WhatsApp Configuration
SESSION_NAME=default
SESSION_PATH=./sessions
PUPPETEER_HEADLESS=true

# Security
API_KEY=your-secret-api-key-here
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 🚀 Uso

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
# Build
npm run build

# Start
npm start
```

## 📄 Documentação da API (Swagger)

Este projeto utiliza Swagger para gerar uma documentação da API interativa e fácil de usar.

Para acessar a documentação:

1. Inicie o servidor em modo de desenvolvimento:
   ```bash
   npm run dev
   ```
2. Abra seu navegador e acesse a seguinte URL:
   ```
   http://localhost:3000/docs
   ```

Você verá a interface do Swagger UI, onde poderá explorar todos os endpoints, ver os parâmetros necessários, os corpos de requisição e até mesmo testar as chamadas de API diretamente pelo navegador.

## 📡 API Endpoints

### Base URL

```
http://localhost:3000/api/v1
```

### Autenticação de Sessão

#### Inicializar Sessão

```http
POST /sessions/:sessionId/init
```

Inicializa uma nova sessão do WhatsApp. Retorna QR Code para escaneamento.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "sessionId": "default",
    "status": "INITIALIZING",
    "qrCode": "data:image/png;base64,..."
  },
  "message": "Session initialized successfully",
  "timestamp": "2025-10-01T00:00:00.000Z"
}
```

#### Obter Sessão

```http
GET /sessions/:sessionId
```

#### Listar Todas as Sessões

```http
GET /sessions
```

#### Destruir Sessão

```http
DELETE /sessions/:sessionId
```

#### Fazer Logout

```http
POST /sessions/:sessionId/logout
```

---

### Mensagens

#### Enviar Mensagem de Texto

```http
POST /sessions/:sessionId/messages/send
```

**Body:**
```json
{
  "chatId": "5511999999999@c.us",
  "content": "Olá! Esta é uma mensagem de teste.",
  "options": {
    "quotedMessageId": "optional_message_id",
    "mentions": ["5511888888888@c.us"]
  }
}
```

#### Enviar Mídia

```http
POST /sessions/:sessionId/messages/send-media
```

**Body:**
```json
{
  "chatId": "5511999999999@c.us",
  "media": {
    "mimetype": "image/png",
    "data": "base64_encoded_data",
    "filename": "image.png"
  },
  "options": {
    "caption": "Legenda da imagem"
  }
}
```

#### Enviar Localização

```http
POST /sessions/:sessionId/messages/send-location
```

**Body:**
```json
{
  "chatId": "5511999999999@c.us",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "name": "São Paulo",
  "address": "São Paulo, SP, Brasil"
}
```

#### Enviar Enquete

```http
POST /sessions/:sessionId/messages/send-poll
```

**Body:**
```json
{
  "chatId": "5511999999999@c.us",
  "question": "Qual sua cor favorita?",
  "options": ["Azul", "Verde", "Vermelho"],
  "allowMultipleAnswers": false
}
```

#### Reagir a Mensagem

```http
POST /sessions/:sessionId/messages/react
```

**Body:**
```json
{
  "chatId": "5511999999999@c.us",
  "messageId": "message_id_here",
  "emoji": "👍"
}
```

#### Encaminhar Mensagem

```http
POST /sessions/:sessionId/messages/forward
```

#### Deletar Mensagem

```http
DELETE /sessions/:sessionId/messages
```

#### Editar Mensagem

```http
PUT /sessions/:sessionId/messages/edit
```

#### Buscar Mensagens

```http
GET /sessions/:sessionId/messages/:chatId?limit=50
```

#### Pesquisar Mensagens

```http
POST /sessions/:sessionId/messages/search
```

#### Baixar Mídia

```http
GET /sessions/:sessionId/messages/:chatId/:messageId/media
```

---

### Chats

#### Listar Todos os Chats

```http
GET /sessions/:sessionId/chats
```

#### Obter Chat Específico

```http
GET /sessions/:sessionId/chats/:chatId
```

#### Arquivar/Desarquivar Chat

```http
POST /sessions/:sessionId/chats/archive
```

**Body:**
```json
{
  "chatId": "5511999999999@c.us",
  "archive": true
}
```

#### Fixar/Desfixar Chat

```http
POST /sessions/:sessionId/chats/pin
```

#### Silenciar/Reativar Chat

```http
POST /sessions/:sessionId/chats/mute
```

**Body:**
```json
{
  "chatId": "5511999999999@c.us",
  "mute": true,
  "duration": 3600
}
```

#### Marcar Como Não Lido

```http
POST /sessions/:sessionId/chats/:chatId/mark-unread
```

#### Enviar Visto

```http
POST /sessions/:sessionId/chats/:chatId/send-seen
```

#### Enviar Estado "Digitando"

```http
POST /sessions/:sessionId/chats/:chatId/send-typing
```

#### Enviar Estado "Gravando Áudio"

```http
POST /sessions/:sessionId/chats/:chatId/send-recording
```

#### Limpar Mensagens

```http
POST /sessions/:sessionId/chats/:chatId/clear
```

#### Deletar Chat

```http
DELETE /sessions/:sessionId/chats/:chatId
```

---

### Grupos

#### Criar Grupo

```http
POST /sessions/:sessionId/groups
```

**Body:**
```json
{
  "name": "Meu Grupo",
  "participantIds": [
    "5511999999999@c.us",
    "5511888888888@c.us"
  ]
}
```

#### Adicionar Participantes

```http
POST /sessions/:sessionId/groups/add-participants
```

#### Remover Participantes

```http
POST /sessions/:sessionId/groups/remove-participants
```

#### Promover a Admin

```http
POST /sessions/:sessionId/groups/promote-participants
```

#### Remover Admin

```http
POST /sessions/:sessionId/groups/demote-participants
```

#### Atualizar Nome do Grupo

```http
PUT /sessions/:sessionId/groups/subject
```

#### Atualizar Descrição do Grupo

```http
PUT /sessions/:sessionId/groups/description
```

#### Atualizar Foto do Grupo

```http
PUT /sessions/:sessionId/groups/picture
```

#### Sair do Grupo

```http
POST /sessions/:sessionId/groups/:groupId/leave
```

#### Obter Código de Convite

```http
GET /sessions/:sessionId/groups/:groupId/invite-code
```

#### Revogar Convite

```http
POST /sessions/:sessionId/groups/:groupId/revoke-invite
```

#### Aceitar Convite

```http
POST /sessions/:sessionId/groups/accept-invite
```

---

### Contatos

#### Listar Todos os Contatos

```http
GET /sessions/:sessionId/contacts
```

#### Obter Contato Específico

```http
GET /sessions/:sessionId/contacts/:contactId
```

#### Obter Foto de Perfil

```http
GET /sessions/:sessionId/contacts/:contactId/profile-pic
```

#### Obter Status/Sobre

```http
GET /sessions/:sessionId/contacts/:contactId/about
```

#### Obter Grupos em Comum

```http
GET /sessions/:sessionId/contacts/:contactId/common-groups
```

#### Bloquear Contato

```http
POST /sessions/:sessionId/contacts/:contactId/block
```

#### Desbloquear Contato

```http
POST /sessions/:sessionId/contacts/:contactId/unblock
```

#### Validar Número

```http
POST /sessions/:sessionId/contacts/validate-number
```

**Body:**
```json
{
  "number": "5511999999999"
}
```

#### Listar Contatos Bloqueados

```http
GET /sessions/:sessionId/contacts/blocked
```

#### Salvar Contato

```http
POST /sessions/:sessionId/contacts/save
```

---

### Perfil

#### Obter Perfil

```http
GET /sessions/:sessionId/profile
```

#### Atualizar Nome

```http
PUT /sessions/:sessionId/profile/name
```

#### Atualizar Status

```http
PUT /sessions/:sessionId/profile/status
```

#### Atualizar Foto

```http
PUT /sessions/:sessionId/profile/picture
```

#### Deletar Foto

```http
DELETE /sessions/:sessionId/profile/picture
```

#### Obter Status da Bateria

```http
GET /sessions/:sessionId/profile/battery
```

---

### Health Check

```http
GET /health
```

## 📁 Estrutura do Projeto

```
api-wwebjs/
├── src/
│   ├── config/
│   │   ├── env.ts                 # Variáveis de ambiente
│   │   ├── logger.ts              # Configuração do Winston
│   │   ├── whatsapp.ts            # Configuração do WhatsApp
│   │   └── index.ts
│   ├── models/
│   │   ├── IWhatsAppClient.ts     # Interfaces do cliente
│   │   ├── IMessage.ts            # Interfaces de mensagens
│   │   ├── IChat.ts               # Interfaces de chats
│   │   ├── IGroup.ts              # Interfaces de grupos
│   │   ├── IContact.ts            # Interfaces de contatos
│   │   ├── IProfile.ts            # Interfaces de perfil
│   │   ├── IResponse.ts           # Interfaces de resposta
│   │   └── index.ts
│   ├── repositories/
│   │   ├── SessionRepository.ts   # Repositório de sessões
│   │   └── index.ts
│   ├── services/
│   │   ├── WhatsAppClientService.ts  # Serviço de clientes
│   │   ├── MessageService.ts         # Serviço de mensagens
│   │   ├── ChatService.ts            # Serviço de chats
│   │   ├── GroupService.ts           # Serviço de grupos
│   │   ├── ContactService.ts         # Serviço de contatos
│   │   ├── ProfileService.ts         # Serviço de perfil
│   │   └── index.ts
│   ├── controllers/
│   │   ├── ClientController.ts    # Controller de clientes
│   │   ├── MessageController.ts   # Controller de mensagens
│   │   └── index.ts              # Demais controllers
│   ├── routes/
│   │   └── index.ts              # Todas as rotas
│   ├── middlewares/
│   │   ├── errorHandler.ts       # Tratamento de erros
│   │   ├── asyncHandler.ts       # Handler assíncrono
│   │   └── index.ts
│   ├── utils/
│   │   ├── ApiError.ts           # Classe de erros
│   │   ├── ApiResponse.ts        # Classe de respostas
│   │   ├── validators.ts         # Validadores
│   │   ├── formatters.ts         # Formatadores
│   │   └── index.ts
│   ├── app.ts                    # Configuração do Express
│   └── server.ts                 # Servidor
├── .env.example
├── .gitignore
├── .eslintrc.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Tecnologias

- **Node.js** - Runtime JavaScript
- **TypeScript** - Superset JavaScript tipado
- **Express** - Framework web
- **whatsapp-web.js** - Biblioteca para WhatsApp Web
- **Puppeteer** - Controle de navegador headless
- **Winston** - Sistema de logs
- **Helmet** - Segurança HTTP
- **CORS** - Cross-Origin Resource Sharing
- **Morgan** - HTTP request logger
- **QRCode** - Gerador de QR Code

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, siga estas diretrizes:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## ⚠️ Avisos Importantes

1. **Não é API Oficial**: Esta biblioteca usa engenharia reversa do WhatsApp Web
2. **Riscos**: O uso pode resultar em banimento temporário ou permanente
3. **Limite de Taxa**: WhatsApp tem limite de mensagens por minuto
4. **Status Online**: O cliente aparecerá online enquanto conectado
5. **Sessão Única**: Apenas uma sessão ativa por número

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

**Willian Quintino**

- GitHub: [@WillianQuintino](https://github.com/WillianQuintino)

## 🙏 Agradecimentos

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
- Comunidade Open Source

---

⭐ Se este projeto te ajudou, considere dar uma estrela!
