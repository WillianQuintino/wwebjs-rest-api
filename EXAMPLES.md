# 📖 Exemplos de Uso da API

## 🚀 Começando

### 1. Iniciar o Servidor

```bash
npm run dev
```

O servidor estará rodando em: `http://localhost:3000`

---

## 📱 Fluxo Básico de Uso

### 1. Inicializar uma Sessão

```bash
curl -X POST http://localhost:3000/api/v1/sessions/minha-sessao/init
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "sessionId": "minha-sessao",
    "status": "QR_CODE",
    "qrCode": "data:image/png;base64,iVBORw0KG..."
  },
  "message": "Session initialized successfully",
  "timestamp": "2025-10-01T00:00:00.000Z"
}
```

> 💡 **Dica**: Use o QR Code retornado para escanear no WhatsApp

### 2. Verificar Status da Sessão

```bash
curl http://localhost:3000/api/v1/sessions/minha-sessao
```

**Resposta quando pronto:**
```json
{
  "success": true,
  "data": {
    "sessionId": "minha-sessao",
    "status": "READY",
    "isReady": true,
    "phoneNumber": "5511999999999",
    "platform": "android",
    "pushname": "Meu Nome"
  }
}
```

### 3. Enviar Primeira Mensagem

```bash
curl -X POST http://localhost:3000/api/v1/sessions/minha-sessao/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "5511999999999@c.us",
    "content": "Olá! Esta é minha primeira mensagem via API!"
  }'
```

---

## 💬 Exemplos de Mensagens

### Mensagem de Texto Simples

```javascript
fetch('http://localhost:3000/api/v1/sessions/minha-sessao/messages/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chatId: '5511999999999@c.us',
    content: 'Olá! Como vai?'
  })
});
```

### Mensagem com Menção

```javascript
fetch('http://localhost:3000/api/v1/sessions/minha-sessao/messages/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chatId: '123456789@g.us',
    content: 'Oi @5511999999999, tudo bem?',
    options: {
      mentions: ['5511999999999@c.us']
    }
  })
});
```

### Responder uma Mensagem (Quote)

```javascript
fetch('http://localhost:3000/api/v1/sessions/minha-sessao/messages/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chatId: '5511999999999@c.us',
    content: 'Concordo com você!',
    options: {
      quotedMessageId: 'message_id_aqui'
    }
  })
});
```

### Enviar Imagem

```javascript
// Primeiro, converta a imagem para base64
const fs = require('fs');
const imageBase64 = fs.readFileSync('path/to/image.jpg').toString('base64');

fetch('http://localhost:3000/api/v1/sessions/minha-sessao/messages/send-media', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chatId: '5511999999999@c.us',
    media: {
      mimetype: 'image/jpeg',
      data: imageBase64,
      filename: 'foto.jpg'
    },
    options: {
      caption: 'Olha que foto legal!'
    }
  })
});
```

### Enviar Áudio

```javascript
const audioBase64 = fs.readFileSync('path/to/audio.mp3').toString('base64');

fetch('http://localhost:3000/api/v1/sessions/minha-sessao/messages/send-media', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chatId: '5511999999999@c.us',
    media: {
      mimetype: 'audio/mp3',
      data: audioBase64,
      filename: 'audio.mp3'
    },
    options: {
      sendAudioAsVoice: true // Envia como áudio de voz
    }
  })
});
```

### Enviar Localização

```javascript
fetch('http://localhost:3000/api/v1/sessions/minha-sessao/messages/send-location', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chatId: '5511999999999@c.us',
    latitude: -23.5505,
    longitude: -46.6333,
    name: 'Avenida Paulista',
    address: 'São Paulo, SP, Brasil'
  })
});
```

### Enviar Enquete

```javascript
fetch('http://localhost:3000/api/v1/sessions/minha-sessao/messages/send-poll', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chatId: '123456789@g.us',
    question: 'Qual o melhor horário para a reunião?',
    options: ['14:00', '15:00', '16:00', '17:00'],
    allowMultipleAnswers: false
  })
});
```

### Reagir a uma Mensagem

```javascript
fetch('http://localhost:3000/api/v1/sessions/minha-sessao/messages/react', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chatId: '5511999999999@c.us',
    messageId: 'message_id_aqui',
    emoji: '👍'
  })
});
```

### Encaminhar Mensagem

```javascript
fetch('http://localhost:3000/api/v1/sessions/minha-sessao/messages/forward', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sourceChatId: '5511999999999@c.us',
    targetChatId: '5511888888888@c.us',
    messageId: 'message_id_aqui'
  })
});
```

---

## 👥 Exemplos de Grupos

### Criar Grupo

```javascript
fetch('http://localhost:3000/api/v1/sessions/minha-sessao/groups', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Meu Grupo de Amigos',
    participantIds: [
      '5511999999999@c.us',
      '5511888888888@c.us',
      '5511777777777@c.us'
    ]
  })
});
```

### Adicionar Participantes

```javascript
fetch('http://localhost:3000/api/v1/sessions/minha-sessao/groups/add-participants', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    groupId: '123456789@g.us',
    participantIds: ['5511666666666@c.us']
  })
});
```

### Promover a Admin

```javascript
fetch('http://localhost:3000/api/v1/sessions/minha-sessao/groups/promote-participants', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    groupId: '123456789@g.us',
    participantIds: ['5511999999999@c.us']
  })
});
```

### Obter Link de Convite

```javascript
fetch('http://localhost:3000/api/v1/sessions/minha-sessao/groups/123456789@g.us/invite-code')
  .then(res => res.json())
  .then(data => {
    console.log(`Link: https://chat.whatsapp.com/${data.data.inviteCode}`);
  });
```

---

## 💬 Exemplos de Chat

### Listar Todos os Chats

```javascript
fetch('http://localhost:3000/api/v1/sessions/minha-sessao/chats')
  .then(res => res.json())
  .then(data => console.log(data.data));
```

### Arquivar Chat

```javascript
fetch('http://localhost:3000/api/v1/sessions/minha-sessao/chats/archive', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chatId: '5511999999999@c.us',
    archive: true
  })
});
```

### Silenciar Chat por 8 Horas

```javascript
fetch('http://localhost:3000/api/v1/sessions/minha-sessao/chats/mute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chatId: '5511999999999@c.us',
    mute: true,
    duration: 28800 // 8 horas em segundos
  })
});
```

### Enviar "Visto"

```javascript
fetch('http://localhost:3000/api/v1/sessions/minha-sessao/chats/5511999999999@c.us/send-seen', {
  method: 'POST'
});
```

### Enviar Estado "Digitando..."

```javascript
fetch('http://localhost:3000/api/v1/sessions/minha-sessao/chats/5511999999999@c.us/send-typing', {
  method: 'POST'
});
```

---

## 👤 Exemplos de Contatos

### Validar Número no WhatsApp

```javascript
fetch('http://localhost:3000/api/v1/sessions/minha-sessao/contacts/validate-number', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    number: '5511999999999'
  })
})
  .then(res => res.json())
  .then(data => {
    if (data.data.exists) {
      console.log('Número existe no WhatsApp:', data.data.jid);
    } else {
      console.log('Número não tem WhatsApp');
    }
  });
```

### Obter Foto de Perfil

```javascript
fetch('http://localhost:3000/api/v1/sessions/minha-sessao/contacts/5511999999999@c.us/profile-pic')
  .then(res => res.json())
  .then(data => console.log('URL da foto:', data.data.url));
```

### Bloquear Contato

```javascript
fetch('http://localhost:3000/api/v1/sessions/minha-sessao/contacts/5511999999999@c.us/block', {
  method: 'POST'
});
```

---

## 🎨 Exemplos de Perfil

### Atualizar Nome de Exibição

```javascript
fetch('http://localhost:3000/api/v1/sessions/minha-sessao/profile/name', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    displayName: 'Meu Novo Nome'
  })
});
```

### Atualizar Status

```javascript
fetch('http://localhost:3000/api/v1/sessions/minha-sessao/profile/status', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'Disponível 🚀'
  })
});
```

---

## 🔧 Exemplos Avançados

### Bot de Auto-resposta

```javascript
// Webhook para receber mensagens (use Socket.io ou polling)
setInterval(async () => {
  const response = await fetch('http://localhost:3000/api/v1/sessions/minha-sessao/chats');
  const { data: chats } = await response.json();

  for (const chat of chats) {
    if (chat.unreadCount > 0) {
      // Auto-responder
      await fetch('http://localhost:3000/api/v1/sessions/minha-sessao/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: chat.id,
          content: 'Obrigado pela mensagem! Responderei em breve.'
        })
      });

      // Marcar como lido
      await fetch(`http://localhost:3000/api/v1/sessions/minha-sessao/chats/${chat.id}/send-seen`, {
        method: 'POST'
      });
    }
  }
}, 5000); // Verifica a cada 5 segundos
```

### Envio em Massa (com delay)

```javascript
const contacts = [
  '5511999999999@c.us',
  '5511888888888@c.us',
  '5511777777777@c.us'
];

async function enviarEmMassa(mensagem) {
  for (const contact of contacts) {
    await fetch('http://localhost:3000/api/v1/sessions/minha-sessao/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: contact,
        content: mensagem
      })
    });

    // Aguarda 3 segundos entre cada envio
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

enviarEmMassa('Olá! Esta é uma mensagem importante.');
```

---

## 📊 Monitoramento

### Verificar Status do Servidor

```bash
curl http://localhost:3000/health
```

### Verificar Bateria do Celular

```bash
curl http://localhost:3000/api/v1/sessions/minha-sessao/battery
```

---

## ⚠️ Boas Práticas

1. **Rate Limiting**: Não envie mais de 20 mensagens por minuto
2. **Delays**: Use delays entre mensagens (3-5 segundos)
3. **Validação**: Sempre valide números antes de enviar
4. **Erros**: Trate erros adequadamente
5. **Sessões**: Use IDs de sessão únicos para cada conta
6. **QR Code**: Renove o QR Code se não for escaneado em 1 minuto

---

## 🆘 Solução de Problemas

### Sessão não conecta

1. Verifique se o Chromium está instalado
2. Tente com `PUPPETEER_HEADLESS=false` no `.env`
3. Certifique-se de que não há outra sessão ativa

### Mensagens não são enviadas

1. Verifique se o `chatId` está correto
2. Confirme se a sessão está com status `READY`
3. Valide o número antes de enviar

### QR Code não aparece

1. Aguarde alguns segundos após a inicialização
2. Verifique os logs do servidor
3. Tente reiniciar a sessão

---

Para mais informações, consulte o [README.md](README.md)
