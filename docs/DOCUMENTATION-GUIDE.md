# 📖 Guia Completo de Documentação

## 🎯 Filosofia: Código Limpo, Documentação Clara

Este projeto segue o princípio:
> **"Código deve ser limpo. Documentação deve ser separada e clara."**

### ❌ O que NÃO fazer:
```typescript
/**
 * @swagger
 * /api/endpoint:
 *   post:
 *     description: Blah blah blah...
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *     responses:
 *       200:
 *         description: Success
 */
async function myFunction() {
  // Código poluído com 50 linhas de comentário Swagger
}
```

### ✅ O que fazer:
```typescript
// ✨ Código limpo, sem comentários
async function myFunction(sessionId: string, dto: MyDTO) {
  const client = service.getClient(sessionId);
  return await client.sendMessage(dto.chatId, dto.content);
}
```

**Documentação separada em**:
- API pública → `src/docs/swagger/en/messages.yaml`
- Funções internas → `docs/internal/SERVICES.md`

---

## 📂 Estrutura de Documentação

```
projeto/
├── src/docs/swagger/          # 🌐 API REST (Swagger/OpenAPI)
│   ├── en/                    # Inglês
│   │   ├── sessions.yaml
│   │   ├── messages.yaml
│   │   ├── chats.yaml
│   │   ├── groups.yaml
│   │   ├── contacts.yaml
│   │   └── profile.yaml
│   └── pt/                    # Português
│       ├── sessions.yaml
│       ├── messages.yaml
│       ├── chats.yaml
│       ├── groups.yaml
│       ├── contacts.yaml
│       └── profile.yaml
│
├── docs/                      # 📚 Documentação Interna
│   ├── README.md             # Índice geral
│   ├── DOCUMENTATION-GUIDE.md # Este arquivo
│   └── internal/             # Docs de código interno
│       ├── SERVICES.md       # Serviços
│       ├── UTILS.md          # Utilitários
│       ├── MODELS.md         # Modelos e interfaces
│       └── ARCHITECTURE.md   # Arquitetura
│
├── CLAUDE.md                  # Guia para Claude Code
└── README-SWAGGER.md         # Guia específico do Swagger
```

---

## 🔧 Como Documentar

### 1️⃣ Endpoint API REST (Público)

**Passo 1**: Escrever código limpo no controller
```typescript
// src/controllers/MessageController.ts
async sendMessage(req: Request, res: Response) {
  const { sessionId } = req.params;
  const message = await messageService.sendMessage(sessionId, req.body);
  return ApiResponse.created(res, message);
}
```

**Passo 2**: Documentar em YAML (Inglês)
```yaml
# src/docs/swagger/en/messages.yaml
/sessions/{sessionId}/messages/send:
  post:
    tags:
      - 💬 Messages
    summary: Send text message
    description: Sends a text message to individual or group chat
    parameters:
      - name: sessionId
        in: path
        required: true
        schema:
          type: string
        example: my-bot
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/SendMessageDTO'
    responses:
      201:
        description: Message sent successfully
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ApiResponse'
      404:
        description: Session not found
```

**Passo 3**: Documentar em YAML (Português)
```yaml
# src/docs/swagger/pt/messages.yaml
/sessions/{sessionId}/messages/send:
  post:
    tags:
      - 💬 Mensagens
    summary: Enviar mensagem de texto
    description: Envia mensagem de texto para chat individual ou grupo
    parameters:
      - name: sessionId
        in: path
        required: true
        schema:
          type: string
        example: meu-bot
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/SendMessageDTO'
    responses:
      201:
        description: Mensagem enviada com sucesso
```

**Passo 4**: Adicionar schema (se novo)
```typescript
// src/config/swagger-en.ts e swagger-pt.ts
SendMessageDTO: {
  type: 'object',
  required: ['chatId', 'content'],
  properties: {
    chatId: { type: 'string', example: '5511999999999@c.us' },
    content: { type: 'string', example: 'Hello!' }
  }
}
```

---

### 2️⃣ Função Interna (Privada)

**Passo 1**: Escrever código limpo
```typescript
// src/services/MessageService.ts:45
async sendMessage(sessionId: string, dto: ISendMessageDTO): Promise<IMessageResponse> {
  const client = this.whatsAppClientService.getClient(sessionId);
  const message = await client.sendMessage(dto.chatId, dto.content, dto.options);
  return formatMessage(message);
}
```

**Passo 2**: Documentar em Markdown
```markdown
<!-- docs/internal/SERVICES.md -->

### `sendMessage(sessionId, dto)`

**Arquivo**: `src/services/MessageService.ts:45`

**O que faz**:
Envia mensagem de texto para um chat do WhatsApp.

**Quando usar**:
- Enviar mensagem simples
- Responder mensagens (reply)
- Mencionar pessoas em grupos

**Parâmetros**:
- `sessionId` (string): ID da sessão (ex: "meu-bot")
- `dto.chatId` (string): ID do chat (ex: "5511999999999@c.us")
- `dto.content` (string): Texto da mensagem
- `dto.options` (opcional):
  - `quotedMessageId`: ID da mensagem para responder
  - `mentions`: Array de IDs para mencionar
  - `linkPreview`: Mostrar preview de links (padrão: true)

**Retorna**:
```typescript
Promise<{
  id: string;
  body: string;
  from: string;
  to: string;
  timestamp: number;
  ack: number;
}>
```

**Erros**:
- `CLIENT_NOT_FOUND`: Sessão não existe
- `CLIENT_NOT_READY`: Sessão não está pronta
- `INVALID_CHAT_ID`: Chat ID inválido

**Exemplo simples**:
\`\`\`typescript
const msg = await messageService.sendMessage('meu-bot', {
  chatId: '5511999999999@c.us',
  content: 'Olá!'
});
console.log('Enviado:', msg.id);
\`\`\`

**Exemplo completo**:
\`\`\`typescript
const msg = await messageService.sendMessage('meu-bot', {
  chatId: '123456789@g.us',
  content: '@João, pode responder?',
  options: {
    mentions: ['5511888888888@c.us'],
    quotedMessageId: 'msg-123'
  }
});
\`\`\`

**Notas importantes**:
- Sempre verifique se sessão está READY antes
- Chat ID deve ter formato correto (@c.us ou @g.us)
- Mentions só funciona em grupos
```

---

## 📝 Template para Documentação Interna

Use este template para documentar novas funções:

```markdown
### `functionName(param1, param2)`

**Arquivo**: `src/path/to/File.ts:LINE`

**O que faz**:
Descrição clara e objetiva em uma linha.

**Quando usar**:
- Caso de uso 1
- Caso de uso 2
- Caso de uso 3

**Parâmetros**:
- `param1` (tipo): Descrição clara
- `param2` (tipo): Descrição clara
  - Pode ter sub-itens
  - Se for objeto complexo

**Retorna**:
`Promise<TipoRetorno>` - Descrição do que retorna

**Erros**:
- `ERROR_CODE_1`: Quando acontece
- `ERROR_CODE_2`: Quando acontece

**Exemplo simples**:
\`\`\`typescript
const result = await functionName('value', 123);
\`\`\`

**Exemplo completo**:
\`\`\`typescript
try {
  const result = await functionName('value', {
    option1: true,
    option2: 'test'
  });
  console.log(result);
} catch (error) {
  if (error.code === 'ERROR_CODE_1') {
    // Handle error
  }
}
\`\`\`

**Notas importantes**:
- Ponto de atenção 1
- Ponto de atenção 2
```

---

## ✅ Checklist para Nova Funcionalidade

Ao adicionar nova funcionalidade, verifique:

**Código**:
- [ ] Código TypeScript limpo (sem comentários)
- [ ] Função implementada e testada
- [ ] Tipos e interfaces definidos

**API REST** (se aplicável):
- [ ] Rota adicionada em `src/routes/index.ts`
- [ ] Controller limpo (sem comentários)
- [ ] Documentado em `src/docs/swagger/en/*.yaml`
- [ ] Documentado em `src/docs/swagger/pt/*.yaml`
- [ ] Schema adicionado em `src/config/swagger-en.ts`
- [ ] Schema adicionado em `src/config/swagger-pt.ts`
- [ ] Testado no Swagger UI (EN e PT)

**Documentação Interna**:
- [ ] Função documentada em `docs/internal/SERVICES.md` (ou UTILS.md)
- [ ] Arquivo e linha especificados
- [ ] Descrição clara do que faz
- [ ] Quando usar especificado
- [ ] Parâmetros documentados
- [ ] Retorno documentado
- [ ] Erros listados
- [ ] Exemplos incluídos (simples e completo)
- [ ] Notas importantes adicionadas

---

## 🎨 Dicas de Boa Documentação

### ✅ Seja Claro e Direto
```markdown
❌ "Esta função realiza o processamento de mensagens via protocolo WhatsApp"
✅ "Envia mensagem de texto para um chat"
```

### ✅ Use Exemplos Reais
```markdown
❌ `chatId: string`
✅ `chatId: '5511999999999@c.us'  // Pessoa
      ou '123456789@g.us'        // Grupo`
```

### ✅ Explique "Quando Usar"
```markdown
✅ **Quando usar**:
- Enviar mensagem simples de texto
- Responder mensagem (reply)
- Mencionar pessoas em grupos
```

### ✅ Mostre Exemplos Simples E Completos
```markdown
**Exemplo simples**:
\`\`\`typescript
await sendMessage('bot', {
  chatId: '5511999999999@c.us',
  content: 'Olá!'
});
\`\`\`

**Exemplo completo com opções**:
\`\`\`typescript
await sendMessage('bot', {
  chatId: '123456789@g.us',
  content: '@João, pode ajudar?',
  options: {
    mentions: ['5511888888888@c.us'],
    quotedMessageId: 'msg-123',
    linkPreview: false
  }
});
\`\`\`
```

### ✅ Liste Erros Comuns
```markdown
**Erros**:
- `CLIENT_NOT_FOUND`: Sessão não existe → Inicialize primeiro
- `CLIENT_NOT_READY`: Aguardando QR Code → Espere scan
- `INVALID_CHAT_ID`: Formato errado → Use @c.us ou @g.us
```

---

## 🔍 Como Encontrar Documentação

### Para Consumidores da API:
1. Abra http://localhost:3000/api-docs (EN)
2. Ou http://localhost:3000/api-docs/br (PT)
3. Navegue pelas tags (Sessions, Messages, etc)
4. Teste diretamente no Swagger UI

### Para Desenvolvedores:
1. Abra `docs/README.md` (índice)
2. Escolha a categoria:
   - `docs/internal/SERVICES.md` - Serviços
   - `docs/internal/UTILS.md` - Utilitários
   - `docs/internal/MODELS.md` - Tipos
3. Use Ctrl+F para buscar função

---

## 🚀 Benefícios desta Abordagem

✅ **Código Limpo**: TypeScript sem poluição visual
✅ **Documentação Clara**: Markdown fácil de ler e editar
✅ **Bilíngue**: EN e PT para alcance global
✅ **Manutenível**: Fácil atualizar sem mexer no código
✅ **Testável**: Swagger UI permite testar endpoints
✅ **Profissional**: Separação clara de responsabilidades

---

**Última atualização**: 2025-10-01
