# WhatsApp Web.js - Documentação de Referência Rápida

> Biblioteca Node.js para integração com WhatsApp Web (v1.34.1)

## 📚 Links Úteis

- **Documentação Oficial**: https://docs.wwebjs.dev/
- **Guia**: https://guide.wwebjs.dev/guide
- **Repositório GitHub**: https://github.com/pedroslopez/whatsapp-web.js
- **Discord**: https://discord.gg/H7DqQs4

---

## 🚀 Instalação

```bash
npm install whatsapp-web.js
```

**Dependências necessárias:**
- Node.js 14+
- Puppeteer (instalado automaticamente)
- Chromium (ou Google Chrome para recursos avançados)

---

## ⚡ Início Rápido

### Exemplo Básico

```javascript
const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    // Gere o QR code para escanear
    console.log('QR RECEIVED', qr);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', msg => {
    if (msg.body === '!ping') {
        msg.reply('pong');
    }
});

client.initialize();
```

---

## 🏗️ Arquitetura Principal

### Client - Classe Principal

O objeto `Client` é o ponto central da biblioteca.

**Inicialização:**
```javascript
const client = new Client({
    authStrategy: new LocalAuth(),  // ou RemoteAuth, NoAuth
    puppeteer: {
        headless: true,
        args: ['--no-sandbox']
    }
});
```

**Métodos Principais:**
- `initialize()` - Inicia o cliente
- `destroy()` - Destrói a sessão
- `logout()` - Faz logout
- `getState()` - Obtém estado atual
- `getChats()` - Lista todos os chats
- `getContacts()` - Lista todos os contatos
- `getChatById(chatId)` - Obtém chat específico
- `getContactById(contactId)` - Obtém contato específico
- `sendMessage(chatId, content, options)` - Envia mensagem
- `getNumberId(number)` - Valida número do WhatsApp
- `isRegisteredUser(id)` - Verifica se usuário está registrado

---

## 📡 Eventos do Client

### Eventos de Conexão

| Evento | Descrição |
|--------|-----------|
| `qr` | QR Code gerado para autenticação |
| `authenticated` | Cliente autenticado com sucesso |
| `auth_failure` | Falha na autenticação |
| `ready` | Cliente pronto para uso |
| `disconnected` | Cliente desconectado |

### Eventos de Mensagem

| Evento | Descrição |
|--------|-----------|
| `message` | Mensagem recebida (inclui próprias mensagens) |
| `message_create` | Mensagem criada (qualquer mensagem nova) |
| `message_ack` | Confirmação de leitura alterada |
| `message_edit` | Mensagem editada |
| `message_revoke_everyone` | Mensagem apagada para todos |
| `message_revoke_me` | Mensagem apagada para mim |
| `message_reaction` | Reação adicionada/removida |

### Eventos de Grupo

| Evento | Descrição |
|--------|-----------|
| `group_join` | Participante entrou no grupo |
| `group_leave` | Participante saiu do grupo |
| `group_update` | Informações do grupo atualizadas |
| `group_admin_changed` | Status de admin alterado |
| `group_membership_request` | Solicitação de entrada no grupo |

### Outros Eventos

| Evento | Descrição |
|--------|-----------|
| `contact_changed` | Informações de contato alteradas |
| `chat_archived` | Chat arquivado/desarquivado |
| `chat_removed` | Chat removido |
| `incoming_call` | Chamada recebida |
| `change_state` | Estado do cliente alterado |
| `change_battery` | Status da bateria alterado |

---

## 💬 Trabalhando com Mensagens

### Classe Message

**Propriedades:**
- `id` - ID da mensagem
- `body` - Texto da mensagem
- `from` - Remetente
- `to` - Destinatário
- `timestamp` - Timestamp Unix
- `type` - Tipo da mensagem (texto, imagem, áudio, etc.)
- `hasMedia` - Possui mídia anexada
- `hasQuotedMsg` - É uma resposta
- `fromMe` - Foi enviada por mim
- `isForwarded` - Foi encaminhada
- `author` - Autor (em grupos)
- `mentionedIds` - IDs mencionados
- `links` - Links na mensagem

**Métodos:**
- `reply(content, options)` - Responder mensagem
- `forward(chat)` - Encaminhar mensagem
- `delete(everyone)` - Deletar mensagem
- `react(emoji)` - Reagir com emoji
- `star()` / `unstar()` - Favoritar/desfavoritar
- `pin(duration)` / `unpin()` - Fixar/desafixar
- `downloadMedia()` - Baixar mídia
- `getChat()` - Obter chat da mensagem
- `getContact()` - Obter contato do remetente
- `getMentions()` - Obter contatos mencionados
- `getQuotedMessage()` - Obter mensagem citada
- `getReactions()` - Obter reações

### Tipos de Mensagem (MessageTypes)

```javascript
const MessageTypes = {
    TEXT: 'chat',
    AUDIO: 'audio',
    VOICE: 'ptt',
    IMAGE: 'image',
    VIDEO: 'video',
    DOCUMENT: 'document',
    STICKER: 'sticker',
    LOCATION: 'location',
    CONTACT_CARD: 'vcard',
    CONTACT_CARD_MULTI: 'multi_vcard',
    POLL_CREATION: 'poll_creation',
    BUTTONS_RESPONSE: 'buttons_response',
    LIST: 'list',
    LIST_RESPONSE: 'list_response'
};
```

### Status de Confirmação (MessageAck)

```javascript
const MessageAck = {
    ACK_ERROR: -1,      // Erro ao enviar
    ACK_PENDING: 0,     // Pendente
    ACK_SERVER: 1,      // Recebido pelo servidor
    ACK_DEVICE: 2,      // Recebido pelo dispositivo
    ACK_READ: 3,        // Lido
    ACK_PLAYED: 4       // Reproduzido (áudio/vídeo)
};
```

---

## 👥 Trabalhando com Chats

### Classe Chat

**Propriedades:**
- `id` - ID do chat
- `name` - Nome do chat
- `isGroup` - É um grupo
- `timestamp` - Último timestamp de atividade
- `unreadCount` - Mensagens não lidas
- `archived` - Chat arquivado
- `pinned` - Chat fixado
- `isMuted` - Chat silenciado
- `muteExpiration` - Timestamp de expiração do mute
- `isReadOnly` - Chat somente leitura
- `lastMessage` - Última mensagem

**Métodos:**
- `sendMessage(content, options)` - Enviar mensagem
- `fetchMessages(options)` - Buscar mensagens
- `sendSeen()` - Marcar como lido
- `sendStateTyping()` - Mostrar "digitando..."
- `sendStateRecording()` - Mostrar "gravando áudio..."
- `clearMessages()` - Limpar mensagens
- `delete()` - Deletar chat
- `archive()` / `unarchive()` - Arquivar/desarquivar
- `pin()` / `unpin()` - Fixar/desafixar
- `mute(date)` / `unmute()` - Silenciar/reativar
- `markUnread()` - Marcar como não lido
- `getContact()` - Obter contato
- `getLabels()` - Obter etiquetas

### GroupChat (herda de Chat)

**Propriedades adicionais:**
- `owner` - Dono do grupo
- `participants` - Lista de participantes
- `createdAt` - Data de criação
- `description` - Descrição do grupo

**Métodos adicionais:**
- `addParticipants(contactIds)` - Adicionar participantes
- `removeParticipants(contactIds)` - Remover participantes
- `promoteParticipants(contactIds)` - Promover a admin
- `demoteParticipants(contactIds)` - Remover admin
- `setSubject(subject)` - Mudar nome do grupo
- `setDescription(description)` - Mudar descrição
- `setPicture(media)` - Mudar foto do grupo
- `deletePicture()` - Remover foto do grupo
- `leave()` - Sair do grupo
- `getInviteCode()` - Obter link de convite
- `revokeInvite()` - Revogar link de convite
- `setMessagesAdminsOnly(adminsOnly)` - Apenas admins enviam mensagens
- `setInfoAdminsOnly(adminsOnly)` - Apenas admins editam info
- `setAddMembersAdminsOnly(adminsOnly)` - Apenas admins adicionam membros
- `getGroupMembershipRequests()` - Obter solicitações de entrada
- `approveGroupMembershipRequests(options)` - Aprovar solicitações
- `rejectGroupMembershipRequests(options)` - Rejeitar solicitações

---

## 👤 Trabalhando com Contatos

### Classe Contact

**Propriedades:**
- `id` - ID do contato
- `name` - Nome do contato
- `pushname` - Nome no WhatsApp
- `shortName` - Nome curto
- `number` - Número de telefone
- `isBusiness` - É conta comercial
- `isEnterprise` - É conta empresarial
- `isGroup` - É grupo
- `isMe` - Sou eu
- `isMyContact` - Está nos meus contatos
- `isUser` - É usuário do WhatsApp
- `isWAContact` - É contato do WhatsApp
- `isBlocked` - Está bloqueado

**Métodos:**
- `getAbout()` - Obter status/sobre
- `getChat()` - Obter chat com o contato
- `getProfilePicUrl()` - Obter URL da foto de perfil
- `getCountryCode()` - Obter código do país
- `getFormattedNumber()` - Obter número formatado
- `getCommonGroups()` - Obter grupos em comum
- `block()` / `unblock()` - Bloquear/desbloquear

---

## 📎 Trabalhando com Mídia

### Classe MessageMedia

```javascript
const { MessageMedia } = require('whatsapp-web.js');

// De arquivo local
const media = MessageMedia.fromFilePath('./image.png');

// De URL
const media = await MessageMedia.fromUrl('https://example.com/image.png');

// Criar manualmente
const media = new MessageMedia(mimetype, base64data, filename);
```

**Propriedades:**
- `mimetype` - Tipo MIME
- `data` - Dados em base64
- `filename` - Nome do arquivo
- `filesize` - Tamanho do arquivo

**Enviar mídia:**
```javascript
const media = MessageMedia.fromFilePath('./image.png');
await chat.sendMessage(media, {
    caption: 'Legenda da imagem'
});
```

**Baixar mídia:**
```javascript
client.on('message', async msg => {
    if (msg.hasMedia) {
        const media = await msg.downloadMedia();
        console.log(media.mimetype);
        console.log(media.data); // base64
    }
});
```

---

## 🔐 Estratégias de Autenticação

### LocalAuth (Recomendado)

Armazena a sessão localmente em arquivos.

```javascript
const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "client-one",  // ID único do cliente
        dataPath: "./sessions"   // Pasta de sessões
    })
});
```

### RemoteAuth

Armazena a sessão remotamente (MongoDB, etc.).

```javascript
const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/wwebjs');

const store = new MongoStore({ mongoose: mongoose });

const client = new Client({
    authStrategy: new RemoteAuth({
        store: store,
        clientId: "client-one",
        backupSyncIntervalMs: 300000
    })
});
```

### NoAuth

Sem persistência de sessão (QR Code a cada inicialização).

```javascript
const { Client, NoAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new NoAuth()
});
```

---

## 🎯 Exemplos Práticos

### 1. Bot de Comandos

```javascript
client.on('message', async msg => {
    const chat = await msg.getChat();

    if (msg.body === '!ping') {
        msg.reply('Pong!');
    }

    if (msg.body === '!info') {
        const contact = await msg.getContact();
        msg.reply(`Nome: ${contact.pushname}\nNúmero: ${contact.number}`);
    }

    if (msg.body === '!groupinfo' && chat.isGroup) {
        msg.reply(`
Grupo: ${chat.name}
Participantes: ${chat.participants.length}
Criado em: ${new Date(chat.createdAt * 1000).toLocaleDateString()}
        `);
    }
});
```

### 2. Enviar Mensagem Programada

```javascript
async function sendScheduledMessage(chatId, message, delay) {
    setTimeout(async () => {
        await client.sendMessage(chatId, message);
    }, delay);
}

// Enviar em 10 segundos
sendScheduledMessage('5511999999999@c.us', 'Olá!', 10000);
```

### 3. Auto-resposta

```javascript
client.on('message', async msg => {
    // Ignorar mensagens próprias e de grupos
    if (msg.fromMe || msg.from.includes('@g.us')) return;

    // Auto-resposta
    await msg.reply('Olá! Estou ausente no momento. Retornarei em breve.');
});
```

### 4. Buscar Mensagens

```javascript
const chat = await client.getChatById('5511999999999@c.us');

// Últimas 50 mensagens
const messages = await chat.fetchMessages({ limit: 50 });

// Mensagens com busca
const results = await client.searchMessages('palavra-chave', {
    chatId: '5511999999999@c.us',
    limit: 20
});
```

### 5. Criar Grupo

```javascript
const participantIds = [
    '5511999999999@c.us',
    '5511888888888@c.us'
];

const group = await client.createGroup('Meu Grupo', participantIds);
console.log('Grupo criado:', group.id._serialized);
```

### 6. Enviar Localização

```javascript
const { Location } = require('whatsapp-web.js');

const location = new Location(-23.5505, -46.6333, {
    name: 'São Paulo',
    address: 'São Paulo, SP, Brasil'
});

await chat.sendMessage(location);
```

### 7. Enviar Enquete (Poll)

```javascript
const { Poll } = require('whatsapp-web.js');

const poll = new Poll('Qual sua cor favorita?', ['Azul', 'Verde', 'Vermelho'], {
    allowMultipleAnswers: false
});

await chat.sendMessage(poll);
```

### 8. Reagir a Mensagens

```javascript
client.on('message', async msg => {
    if (msg.body === '!like') {
        await msg.react('👍');
    }
});
```

### 9. Encaminhar Mensagem

```javascript
client.on('message', async msg => {
    if (msg.body === '!forward') {
        const targetChat = await client.getChatById('5511999999999@c.us');
        await msg.forward(targetChat);
    }
});
```

### 10. Validar Número WhatsApp

```javascript
async function isWhatsAppNumber(number) {
    const numberId = await client.getNumberId(number);
    return numberId !== null;
}

const exists = await isWhatsAppNumber('5511999999999');
console.log('Existe no WhatsApp:', exists);
```

---

## 🔧 Configurações Avançadas

### Configuração do Puppeteer

```javascript
const client = new Client({
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});
```

### Acessar Página Puppeteer

```javascript
client.initialize();

client.on('ready', async () => {
    const page = client.pupPage;
    const browser = client.pupBrowser;

    // Executar código na página
    const result = await page.evaluate(() => {
        return window.WWebJS.version;
    });

    console.log('Versão WWebJS:', result);
});
```

### WebCache (Cache de sessão)

```javascript
const { Client, LocalAuth, LocalWebCache } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth(),
    webCache: new LocalWebCache(),
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
    }
});
```

---

## 📊 Estados do Cliente (WAState)

```javascript
const WAState = {
    CONFLICT: 'CONFLICT',                    // Conflito (sessão aberta em outro lugar)
    CONNECTED: 'CONNECTED',                  // Conectado
    DEPRECATED_VERSION: 'DEPRECATED_VERSION', // Versão depreciada
    OPENING: 'OPENING',                      // Abrindo
    PAIRING: 'PAIRING',                      // Pareando
    PROXYBLOCK: 'PROXYBLOCK',                // Proxy bloqueado
    SMB_TOS_BLOCK: 'SMB_TOS_BLOCK',         // Bloqueado por termos de serviço (Business)
    TIMEOUT: 'TIMEOUT',                      // Timeout
    TOS_BLOCK: 'TOS_BLOCK',                  // Bloqueado por termos de serviço
    UNLAUNCHED: 'UNLAUNCHED',                // Não iniciado
    UNPAIRED: 'UNPAIRED',                    // Não pareado
    UNPAIRED_IDLE: 'UNPAIRED_IDLE'           // Não pareado (inativo)
};
```

---

## 🛠️ Utilitários

### Formatar para Sticker

```javascript
const { Util, MessageMedia } = require('whatsapp-web.js');

client.on('message', async msg => {
    if (msg.hasMedia && msg.type === 'image') {
        const media = await msg.downloadMedia();
        const sticker = await Util.formatImageToWebpSticker(media);
        await msg.reply(sticker);
    }
});
```

### Configurar Perfil

```javascript
// Mudar nome de exibição
await client.setDisplayName('Meu Nome');

// Mudar status
await client.setStatus('Disponível');

// Mudar foto de perfil
const media = MessageMedia.fromFilePath('./profile.jpg');
await client.setProfilePicture(media);

// Remover foto de perfil
await client.deleteProfilePicture();
```

---

## ⚠️ Observações Importantes

1. **Não é API Oficial**: Esta biblioteca usa engenharia reversa do WhatsApp Web
2. **Riscos**: Uso pode resultar em banimento temporário ou permanente
3. **Limite de Taxa**: WhatsApp tem limite de mensagens por minuto
4. **Chromium Necessário**: Biblioteca usa Puppeteer que requer Chromium
5. **Sessão Única**: Apenas uma sessão ativa por número
6. **Mensagens em Lote**: Evite enviar muitas mensagens rapidamente
7. **Status Online**: Cliente aparecerá online enquanto conectado
8. **Grupos**: Algumas operações de grupo requerem permissões de admin

---

## 📖 Referência Completa da API

### Classes Principais
- **Client** - Cliente principal
- **Message** - Mensagem
- **Chat** - Chat
- **GroupChat** - Chat de grupo
- **PrivateChat** - Chat privado
- **Contact** - Contato
- **BusinessContact** - Contato comercial
- **PrivateContact** - Contato privado
- **MessageMedia** - Mídia de mensagem
- **Location** - Localização
- **Poll** - Enquete
- **Buttons** - Botões
- **List** - Lista
- **Reaction** - Reação
- **Label** - Etiqueta
- **Call** - Chamada
- **Channel** - Canal (WhatsApp Business)
- **Broadcast** - Transmissão

### Estratégias de Autenticação
- **LocalAuth** - Autenticação local
- **RemoteAuth** - Autenticação remota
- **NoAuth** - Sem autenticação

### Utilitários
- **Util** - Funções utilitárias
- **ClientInfo** - Informações do cliente
- **GroupNotification** - Notificação de grupo
- **InterfaceController** - Controle de interface

---

## 🔗 Links de Documentação Detalhada

- **Client**: https://docs.wwebjs.dev/Client.html
- **Message**: https://docs.wwebjs.dev/Message.html
- **Chat**: https://docs.wwebjs.dev/Chat.html
- **GroupChat**: https://docs.wwebjs.dev/GroupChat.html
- **Contact**: https://docs.wwebjs.dev/Contact.html
- **MessageMedia**: https://docs.wwebjs.dev/MessageMedia.html
- **LocalAuth**: https://docs.wwebjs.dev/LocalAuth.html
- **RemoteAuth**: https://docs.wwebjs.dev/RemoteAuth.html
- **Events**: https://docs.wwebjs.dev/Client.html#event:qr

---

**Última atualização**: 2025-10-01
**Versão da biblioteca**: 1.34.1
