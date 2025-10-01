# 📚 Documentação Completa - WhatsApp Web.js API

## 📖 Índice

- **API REST** → [Swagger UI](http://localhost:3000/api-docs) (EN) | [Swagger PT-BR](http://localhost:3000/api-docs/br)
- **Funções Internas** → [Documentação de Serviços](./internal/SERVICES.md)
- **Utilitários** → [Documentação de Utils](./internal/UTILS.md)
- **Modelos** → [Interfaces e DTOs](./internal/MODELS.md)

---

## 🎯 Como a Documentação Funciona

### 1️⃣ API REST (Endpoints Públicos)
**Arquivo**: `src/docs/swagger/en/*.yaml` e `src/docs/swagger/pt/*.yaml`

**Uso**: Documentação para quem vai **consumir a API**

**Acesso**:
- http://localhost:3000/api-docs (Inglês)
- http://localhost:3000/api-docs/br (Português)

**Exemplo**:
```yaml
# src/docs/swagger/en/messages.yaml
/sessions/{sessionId}/messages/send:
  post:
    summary: Send text message
    description: Sends a text message to individual or group chat
```

---

### 2️⃣ Funções Internas (Código)
**Arquivo**: `docs/internal/*.md`

**Uso**: Documentação para **desenvolvedores que vão modificar o código**

**Sem poluição**: Código TypeScript permanece limpo, documentação fica separada

**Exemplo**:
```markdown
# docs/internal/SERVICES.md

## sendMessage()
**Arquivo**: src/services/MessageService.ts:45
**Descrição**: Envia mensagem de texto
**Parâmetros**: ...
```

---

## 📂 Estrutura de Documentação

```
docs/
├── README.md                    # Este arquivo (índice geral)
├── internal/                    # Documentação interna (código)
│   ├── SERVICES.md             # Serviços (WhatsApp, Message, Chat, etc)
│   ├── UTILS.md                # Utilitários e helpers
│   ├── MODELS.md               # Interfaces e tipos
│   └── ARCHITECTURE.md         # Arquitetura do sistema
│
src/docs/swagger/                # Documentação API REST
├── en/                          # Inglês
│   ├── sessions.yaml
│   ├── messages.yaml
│   ├── chats.yaml
│   ├── groups.yaml
│   ├── contacts.yaml
│   └── profile.yaml
└── pt/                          # Português
    ├── sessions.yaml
    ├── messages.yaml
    ├── chats.yaml
    ├── groups.yaml
    ├── contacts.yaml
    └── profile.yaml
```

---

## 🔍 Quando Usar Cada Documentação

| Situação | Documentação | Local |
|----------|--------------|-------|
| Consumir API via HTTP | Swagger UI | http://localhost:3000/api-docs |
| Entender como funciona o código | Internal Docs | `docs/internal/SERVICES.md` |
| Adicionar novo endpoint | Swagger YAML | `src/docs/swagger/en/*.yaml` |
| Modificar serviço existente | Internal Docs | `docs/internal/SERVICES.md` |
| Ver tipos e interfaces | Internal Docs | `docs/internal/MODELS.md` |

---

## ✍️ Como Adicionar Documentação

### Para Novo Endpoint (API REST):

1. **Criar rota** em `src/routes/index.ts`
2. **Documentar em YAML** (ambos idiomas):
   - `src/docs/swagger/en/[domain].yaml`
   - `src/docs/swagger/pt/[domain].yaml`
3. **Adicionar schema** (se necessário):
   - `src/config/swagger-en.ts`
   - `src/config/swagger-pt.ts`

**Exemplo**:
```yaml
# src/docs/swagger/en/messages.yaml
/sessions/{sessionId}/messages/star:
  post:
    tags: [💬 Messages]
    summary: Star message
    parameters:
      - name: sessionId
        in: path
        required: true
        schema:
          type: string
    requestBody:
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/StarMessageDTO'
    responses:
      200:
        description: Message starred
```

---

### Para Função Interna (Código):

1. **Escrever código** sem comentários
2. **Documentar em Markdown**: `docs/internal/SERVICES.md`

**Template**:
```markdown
### `functionName(param1, param2)`

**Arquivo**: `src/services/MyService.ts:123`

**Descrição**:
Breve descrição do que a função faz.

**Parâmetros**:
- `param1` (tipo): Descrição
- `param2` (tipo): Descrição

**Retorna**:
`Promise<ReturnType>` - Descrição do retorno

**Erros**:
- `ApiError.notFound()` - Quando...
- `ApiError.badRequest()` - Quando...

**Exemplo**:
\`\`\`typescript
const result = await service.functionName('value1', 'value2');
console.log(result);
\`\`\`

**Notas**:
- Importante: ...
- Atenção: ...
```

---

## 🎨 Padrões de Documentação

### ✅ Documentação Clara

```markdown
### `sendMessage(sessionId, dto)`

**O que faz**: Envia mensagem de texto para um chat

**Quando usar**: Quando você precisa enviar texto simples

**Parâmetros**:
- `sessionId`: ID da sessão (exemplo: "meu-bot")
- `dto.chatId`: ID do chat (exemplo: "5511999999999@c.us")
- `dto.content`: Texto da mensagem

**Exemplo simples**:
\`\`\`typescript
await sendMessage('meu-bot', {
  chatId: '5511999999999@c.us',
  content: 'Olá!'
});
\`\`\`

**Com opções avançadas**:
\`\`\`typescript
await sendMessage('meu-bot', {
  chatId: '5511999999999@c.us',
  content: 'Resposta aqui',
  options: {
    quotedMessageId: 'msg-123',  // Responder mensagem
    mentions: ['5511888888888@c.us']  // Mencionar alguém
  }
});
\`\`\`
```

### ❌ Documentação Confusa

```markdown
### sendMessage
Função para enviar msg. Usa DTO. Retorna Promise.
```

---

## 📋 Checklist para Nova Funcionalidade

- [ ] Código implementado
- [ ] Swagger EN documentado (`src/docs/swagger/en/`)
- [ ] Swagger PT documentado (`src/docs/swagger/pt/`)
- [ ] Schema adicionado (se necessário)
- [ ] Documentação interna (`docs/internal/`)
- [ ] Exemplos de uso incluídos
- [ ] Testado no Swagger UI

---

## 🚀 Links Rápidos

- [Swagger UI (EN)](http://localhost:3000/api-docs)
- [Swagger UI (PT-BR)](http://localhost:3000/api-docs/br)
- [Documentação de Serviços](./internal/SERVICES.md)
- [Documentação de Utils](./internal/UTILS.md)
- [Modelos e Interfaces](./internal/MODELS.md)
- [Arquitetura](./internal/ARCHITECTURE.md)
- [CLAUDE.md (Guia para Claude Code)](../CLAUDE.md)
