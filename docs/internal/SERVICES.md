# 📦 Documentação de Serviços

> Documentação clara de todas as funções dos serviços internos

---

## 📱 WhatsAppClientService

### `initializeClient(sessionId)`

**📁 Arquivo**: `src/services/WhatsAppClientService.ts:50`

**🎯 O que faz**:
Cria uma nova sessão do WhatsApp e gera o QR Code para autenticação.

**📝 Quando usar**:
- Ao conectar um novo número do WhatsApp
- Quando precisa criar uma nova sessão
- No primeiro uso da API

**⚙️ Parâmetros**:
```typescript
sessionId: string  // Identificador único (ex: "bot-vendas", "atendimento-01")
```

**✅ Retorna**:
```typescript
Promise<{
  sessionId: string;
  status: 'INITIALIZING';
  qrCode?: string;  // Estará disponível em segundos
  isReady: false;
}>
```

**❌ Erros**:
- `CLIENT_ALREADY_EXISTS`: Sessão com este ID já existe
- Use outro ID ou destrua a sessão existente

**💡 Exemplo básico**:
```typescript
const session = await whatsAppClientService.initializeClient('meu-bot');
console.log('Sessão criada:', session.sessionId);
// Status: INITIALIZING
// Aguarde alguns segundos para QR Code aparecer
```

**🔄 Fluxo completo**:
```typescript
// 1. Inicializar
const session = await whatsAppClientService.initializeClient('bot-01');

// 2. Aguardar QR Code (em alguns segundos)
setTimeout(async () => {
  const info = whatsAppClientService.getClientInfo('bot-01');
  console.log('QR Code disponível:', info.qrCode);
  // Status agora: QR_CODE
}, 5000);

// 3. Após escanear no celular
// Status muda: QR_CODE → AUTHENTICATING → READY

// 4. Verificar se está pronto
const info = whatsAppClientService.getClientInfo('bot-01');
if (info.status === 'READY') {
  console.log('Pronto para usar!', info.phoneNumber);
}
```

---

### `getClient(sessionId)`

**📁 Arquivo**: `src/services/WhatsAppClientService.ts:120`

**🎯 O que faz**:
Retorna o cliente WhatsApp pronto para enviar mensagens.

**📝 Quando usar**:
- **Antes de qualquer operação** (enviar mensagem, criar grupo, etc)
- Para garantir que a sessão existe e está pronta

**⚙️ Parâmetros**:
```typescript
sessionId: string  // ID da sessão
```

**✅ Retorna**:
```typescript
Client  // Cliente whatsapp-web.js pronto para uso
```

**❌ Erros**:
- `CLIENT_NOT_FOUND`: Sessão não existe → Inicialize primeiro
- `CLIENT_NOT_READY`: Sessão existe mas não autenticou → Aguarde QR scan

**💡 Exemplo**:
```typescript
// ✅ CORRETO - Sempre use getClient()
const client = whatsAppClientService.getClient('meu-bot');
await client.sendMessage('5511999999999@c.us', 'Olá!');

// ❌ ERRADO - Nunca acesse repositório direto
const session = sessionRepository.findById('meu-bot');
const client = session.client; // PERIGOSO - pode não estar pronto
```

**🔒 Por que usar sempre**:
1. ✅ Valida que sessão existe
2. ✅ Valida que sessão está pronta (READY)
3. ✅ Retorna erro claro se algo está errado
4. ✅ Seguro e confiável

---

### `getClientInfo(sessionId)`

**📁 Arquivo**: `src/services/WhatsAppClientService.ts:145`

**🎯 O que faz**:
Retorna informações sobre a sessão (status, QR code, telefone).

**📝 Quando usar**:
- Verificar status da sessão
- Pegar QR Code para mostrar ao usuário
- Ver se está pronto para enviar mensagens
- Monitoramento de sessões

**⚙️ Parâmetros**:
```typescript
sessionId: string
```

**✅ Retorna**:
```typescript
{
  sessionId: string;
  status: 'INITIALIZING' | 'QR_CODE' | 'AUTHENTICATING' | 'READY' | 'DISCONNECTED';
  isReady: boolean;
  qrCode?: string;        // Base64 PNG (quando status = QR_CODE)
  phoneNumber?: string;   // Número conectado (quando status = READY)
  platform?: string;      // 'android', 'ios' (quando status = READY)
  pushname?: string;      // Nome do perfil (quando status = READY)
}
```

**❌ Erros**:
- `CLIENT_NOT_FOUND`: Sessão não existe

**💡 Exemplos**:

**Verificar se está pronto**:
```typescript
const info = whatsAppClientService.getClientInfo('meu-bot');

if (info.isReady) {
  console.log('✅ Pronto para enviar mensagens');
  console.log('📞 Conectado como:', info.phoneNumber);
} else {
  console.log('⏳ Status:', info.status);
  if (info.qrCode) {
    console.log('📱 QR Code disponível - mostre ao usuário');
  }
}
```

**Polling até ficar pronto**:
```typescript
async function waitUntilReady(sessionId: string) {
  while (true) {
    const info = whatsAppClientService.getClientInfo(sessionId);

    if (info.status === 'READY') {
      console.log('✅ Conectado!', info.phoneNumber);
      break;
    }

    if (info.status === 'QR_CODE') {
      console.log('⏳ Aguardando scan do QR Code...');
    }

    if (info.status === 'DISCONNECTED') {
      throw new Error('❌ Sessão desconectou');
    }

    await new Promise(r => setTimeout(r, 2000)); // Aguarda 2s
  }
}

await waitUntilReady('meu-bot');
```

**Monitorar todas as sessões**:
```typescript
const allSessions = whatsAppClientService.getAllSessions();

allSessions.forEach(session => {
  console.log(`${session.sessionId}: ${session.status}`);
  if (session.isReady) {
    console.log(`  📞 ${session.phoneNumber}`);
  }
});
```

---

### `destroyClient(sessionId)`

**📁 Arquivo**: `src/services/WhatsAppClientService.ts:180`

**🎯 O que faz**:
**DESTRÓI COMPLETAMENTE** a sessão. Remove tudo.

**📝 Quando usar**:
- ❌ Desligar bot permanentemente
- ❌ Trocar de número do WhatsApp
- ❌ Limpar sessão corrompida
- ❌ Liberar memória

**⚠️ ATENÇÃO**: Ação IRREVERSÍVEL! Terá que autenticar novamente.

**⚙️ Parâmetros**:
```typescript
sessionId: string
```

**✅ Retorna**:
```typescript
Promise<void>
```

**❌ Erros**:
- `CLIENT_NOT_FOUND`: Sessão não existe

**💡 Exemplo**:
```typescript
// ⚠️ CUIDADO - Isso remove TUDO
await whatsAppClientService.destroyClient('bot-antigo');

// Após destroy, precisa criar novamente
await whatsAppClientService.initializeClient('bot-antigo');
// Terá que escanear QR Code novamente
```

**🆚 destroy vs logout**:

| Ação | destroy | logout |
|------|---------|--------|
| Desconecta WhatsApp | ✅ | ✅ |
| Remove da memória | ✅ | ❌ |
| Apaga autenticação | ✅ | ❌ |
| Pode reconectar fácil | ❌ | ✅ |
| Precisa novo QR | ✅ | Depende |

**Recomendação**: Use `logout()` se quiser desconectar temporariamente.

---

### `logoutClient(sessionId)`

**📁 Arquivo**: `src/services/WhatsAppClientService.ts:195`

**🎯 O que faz**:
Desconecta do WhatsApp mas **mantém a sessão** na memória.

**📝 Quando usar**:
- ✅ Desconectar temporariamente
- ✅ Manutenção do sistema
- ✅ Trocar entre várias sessões
- ✅ Testar reconexão

**⚙️ Parâmetros**:
```typescript
sessionId: string
```

**✅ Retorna**:
```typescript
Promise<void>
```

**💡 Exemplo**:
```typescript
// Desconectar
await whatsAppClientService.logoutClient('meu-bot');
console.log('Desconectado - mas sessão ainda existe');

// Reconectar (pode não precisar de QR Code novamente)
await whatsAppClientService.initializeClient('meu-bot');
```

---

### `getAllSessions()`

**📁 Arquivo**: `src/services/WhatsAppClientService.ts:210`

**🎯 O que faz**:
Lista TODAS as sessões ativas.

**📝 Quando usar**:
- Dashboard de monitoramento
- Health check
- Listagem de bots ativos

**✅ Retorna**:
```typescript
Array<{
  sessionId: string;
  status: string;
  isReady: boolean;
  phoneNumber?: string;
}>
```

**💡 Exemplo**:
```typescript
const sessions = whatsAppClientService.getAllSessions();

console.log(`Total de sessões: ${sessions.length}`);

sessions.forEach(s => {
  const icon = s.isReady ? '✅' : '⏳';
  console.log(`${icon} ${s.sessionId} - ${s.status}`);
});

// Filtrar apenas prontas
const ready = sessions.filter(s => s.isReady);
console.log(`Prontas: ${ready.length}`);
```

---

### `cleanupOldSessions(threshold?)`

**📁 Arquivo**: `src/services/WhatsAppClientService.ts:225`

**🎯 O que faz**:
Remove sessões desconectadas há muito tempo.

**📝 Quando usar**:
- Executar periodicamente (cron job)
- Liberar memória
- Manutenção automática

**⚙️ Parâmetros**:
```typescript
threshold?: number  // Tempo em ms (padrão: 1 hora = 3600000)
```

**✅ Retorna**:
```typescript
void
```

**💡 Exemplo**:
```typescript
// Limpar sessões desconectadas > 1 hora (padrão)
whatsAppClientService.cleanupOldSessions();

// Limpar sessões desconectadas > 30 minutos
whatsAppClientService.cleanupOldSessions(30 * 60 * 1000);

// Executar a cada hora
setInterval(() => {
  whatsAppClientService.cleanupOldSessions();
  console.log('🧹 Limpeza de sessões antigas executada');
}, 3600000);
```

---

## 💬 MessageService

### `sendMessage(sessionId, dto)`

**📁 Arquivo**: `src/services/MessageService.ts:25`

**🎯 O que faz**:
Envia mensagem de texto para um chat.

**📝 Quando usar**:
- Enviar texto simples
- Responder mensagem (reply)
- Mencionar pessoas em grupos
- Enviar links com preview

**⚙️ Parâmetros**:
```typescript
sessionId: string

dto: {
  chatId: string;     // '5511999999999@c.us' (pessoa) ou '123456789@g.us' (grupo)
  content: string;    // Texto da mensagem
  options?: {
    quotedMessageId?: string;   // ID da mensagem para responder
    mentions?: string[];        // IDs para mencionar (@)
    linkPreview?: boolean;      // Mostrar preview de link (padrão: true)
  }
}
```

**✅ Retorna**:
```typescript
Promise<{
  id: string;
  body: string;
  from: string;
  to: string;
  timestamp: number;
  ack: number;  // 1=enviado, 2=recebido, 3=lido
}>
```

**💡 Exemplos**:

**Mensagem simples**:
```typescript
const msg = await messageService.sendMessage('meu-bot', {
  chatId: '5511999999999@c.us',
  content: 'Olá! Como posso ajudar?'
});

console.log('Mensagem enviada, ID:', msg.id);
```

**Responder uma mensagem**:
```typescript
await messageService.sendMessage('meu-bot', {
  chatId: '5511999999999@c.us',
  content: 'Respondendo sua pergunta...',
  options: {
    quotedMessageId: 'msg-id-aqui'
  }
});
```

**Mencionar alguém em grupo**:
```typescript
await messageService.sendMessage('meu-bot', {
  chatId: '123456789@g.us',
  content: '@João, você pode responder isso?',
  options: {
    mentions: ['5511888888888@c.us']  // ID do João
  }
});
```

**Link sem preview**:
```typescript
await messageService.sendMessage('meu-bot', {
  chatId: '5511999999999@c.us',
  content: 'Veja: https://exemplo.com',
  options: {
    linkPreview: false
  }
});
```

---

### `sendMedia(sessionId, dto)`

**📁 Arquivo**: `src/services/MessageService.ts:55`

**🎯 O que faz**:
Envia arquivo (imagem, vídeo, áudio, documento).

**📝 Quando usar**:
- Enviar fotos
- Enviar vídeos
- Enviar áudio/voz
- Enviar PDF ou documentos

**⚙️ Parâmetros**:
```typescript
sessionId: string

dto: {
  chatId: string;
  media: {
    mimetype: string;    // Tipo do arquivo
    data: string;        // Base64 do arquivo
    filename?: string;   // Nome do arquivo
  };
  options?: {
    caption?: string;    // Legenda
  }
}
```

**📋 Tipos suportados**:
- 🖼️ Imagens: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- 🎥 Vídeos: `video/mp4`, `video/3gpp`, `video/quicktime`
- 🎵 Áudio: `audio/mpeg`, `audio/ogg`, `audio/wav`
- 📄 Documentos: `application/pdf`, `application/zip`, etc.

**⚠️ Limite**: 16 MB (configurável em `.env` → `MAX_FILE_SIZE`)

**✅ Retorna**:
```typescript
Promise<MessageResponse>
```

**💡 Exemplos**:

**Enviar imagem**:
```typescript
const fs = require('fs');

// Ler arquivo e converter para base64
const imageBuffer = fs.readFileSync('foto.jpg');
const base64 = imageBuffer.toString('base64');

await messageService.sendMedia('meu-bot', {
  chatId: '5511999999999@c.us',
  media: {
    mimetype: 'image/jpeg',
    data: base64,
    filename: 'foto.jpg'
  },
  options: {
    caption: 'Olha essa foto!'
  }
});
```

**Enviar PDF**:
```typescript
const pdfBuffer = fs.readFileSync('relatorio.pdf');
const pdfBase64 = pdfBuffer.toString('base64');

await messageService.sendMedia('meu-bot', {
  chatId: '5511999999999@c.us',
  media: {
    mimetype: 'application/pdf',
    data: pdfBase64,
    filename: 'relatorio.pdf'
  }
});
```

**Enviar áudio como voz**:
```typescript
const audioBuffer = fs.readFileSync('audio.mp3');
const audioBase64 = audioBuffer.toString('base64');

await messageService.sendMedia('meu-bot', {
  chatId: '5511999999999@c.us',
  media: {
    mimetype: 'audio/mpeg',
    data: audioBase64
  },
  options: {
    sendAudioAsVoice: true  // Aparece como mensagem de voz
  }
});
```

---

### `reactToMessage(sessionId, dto)`

**📁 Arquivo**: `src/services/MessageService.ts:95`

**🎯 O que faz**:
Adiciona reação emoji em uma mensagem.

**📝 Quando usar**:
- Reagir com 👍, ❤️, 😂, etc
- Confirmar recebimento de forma rápida
- Interação casual

**⚙️ Parâmetros**:
```typescript
sessionId: string

dto: {
  messageId: string;  // ID da mensagem
  chatId: string;
  emoji: string;      // Um emoji apenas
}
```

**💡 Exemplo**:
```typescript
await messageService.reactToMessage('meu-bot', {
  messageId: 'msg-123',
  chatId: '5511999999999@c.us',
  emoji: '👍'
});
```

**❌ Remover reação** (envie emoji vazio):
```typescript
await messageService.reactToMessage('meu-bot', {
  messageId: 'msg-123',
  chatId: '5511999999999@c.us',
  emoji: ''
});
```

---

## 📊 ChatService

### `getAllChats(sessionId)`

**📁 Arquivo**: `src/services/ChatService.ts:15`

**🎯 O que faz**:
Lista todas as conversas (pessoas e grupos).

**✅ Retorna**:
```typescript
Promise<Array<{
  id: string;
  name: string;
  isGroup: boolean;
  unreadCount: number;
  archived: boolean;
  pinned: boolean;
  isMuted: boolean;
  lastMessage?: {
    body: string;
    timestamp: number;
  }
}>>
```

**💡 Exemplo**:
```typescript
const chats = await chatService.getAllChats('meu-bot');

// Filtrar não lidos
const unread = chats.filter(c => c.unreadCount > 0);
console.log(`Mensagens não lidas: ${unread.length}`);

// Filtrar grupos
const groups = chats.filter(c => c.isGroup);
console.log(`Grupos: ${groups.length}`);

// Listar últimas mensagens
chats.forEach(chat => {
  console.log(`${chat.name}: ${chat.lastMessage?.body}`);
});
```

---

### `archiveChat(sessionId, dto)`

**📁 Arquivo**: `src/services/ChatService.ts:35`

**🎯 O que faz**:
Arquiva ou desarquiva uma conversa.

**⚙️ Parâmetros**:
```typescript
dto: {
  chatId: string;
  archive: boolean;  // true = arquivar, false = desarquivar
}
```

**💡 Exemplo**:
```typescript
// Arquivar
await chatService.archiveChat('meu-bot', {
  chatId: '5511999999999@c.us',
  archive: true
});

// Desarquivar
await chatService.archiveChat('meu-bot', {
  chatId: '5511999999999@c.us',
  archive: false
});
```

---

**📌 Continua em UTILS.md, MODELS.md...**
