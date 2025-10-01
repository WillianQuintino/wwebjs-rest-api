# 📚 Documentação Swagger/OpenAPI

## 🌐 Acessar Documentação

A API possui documentação Swagger em **dois idiomas**:

- **Inglês**: http://localhost:3000/api-docs
- **Português**: http://localhost:3000/api-docs/br

## 📁 Estrutura da Documentação

```
src/docs/swagger/
├── en/                    # Documentação em Inglês
│   ├── sessions.yaml      # Endpoints de sessão
│   ├── messages.yaml      # Endpoints de mensagens
│   ├── chats.yaml         # Endpoints de conversas
│   ├── groups.yaml        # Endpoints de grupos
│   ├── contacts.yaml      # Endpoints de contatos
│   └── profile.yaml       # Endpoints de perfil
│
└── pt/                    # Documentação em Português
    ├── sessions.yaml
    ├── messages.yaml
    ├── chats.yaml
    ├── groups.yaml
    ├── contacts.yaml
    └── profile.yaml
```

## 🔧 Arquivos de Configuração

- `src/config/swagger-en.ts` - Configuração Swagger em inglês
- `src/config/swagger-pt.ts` - Configuração Swagger em português
- `src/config/swagger.ts` - Configuração original (mantido para compatibilidade)

## ✨ Vantagens da Nova Estrutura

### 1. **Código Limpo**
- Documentação **separada** dos controllers
- Arquivos YAML organizados por domínio
- Sem poluição visual no código TypeScript

### 2. **Multi-idioma**
- Documentação completa em **Inglês** e **Português**
- Fácil adicionar novos idiomas
- Mesmo servidor, rotas diferentes

### 3. **Manutenção Fácil**
- Edite arquivos YAML sem mexer no código
- Schemas reutilizáveis entre idiomas
- Estrutura modular e escalável

### 4. **100% Documentado**
- ✅ Session Management (10 endpoints)
- ✅ Messages (10 endpoints)
- ✅ Chats (11 endpoints)
- ✅ Groups (12 endpoints)
- ✅ Contacts (10 endpoints)
- ✅ Profile (5 endpoints)

**Total**: 58 endpoints completamente documentados

## 🚀 Como Adicionar Nova Documentação

### 1. Criar arquivo YAML

**Inglês** (`src/docs/swagger/en/nova-feature.yaml`):
```yaml
/sessions/{sessionId}/nova-feature:
  post:
    tags:
      - 🆕 New Feature
    summary: Short description
    description: Detailed description
    parameters:
      - name: sessionId
        in: path
        required: true
        schema:
          type: string
    responses:
      200:
        description: Success
```

**Português** (`src/docs/swagger/pt/nova-feature.yaml`):
```yaml
/sessions/{sessionId}/nova-feature:
  post:
    tags:
      - 🆕 Nova Funcionalidade
    summary: Descrição curta
    description: Descrição detalhada
    parameters:
      - name: sessionId
        in: path
        required: true
        schema:
          type: string
    responses:
      200:
        description: Sucesso
```

### 2. Schema (se necessário)

Adicione em `src/config/swagger-en.ts` e `src/config/swagger-pt.ts`:

```typescript
NovaFeatureDTO: {
  type: 'object',
  required: ['campo1'],
  properties: {
    campo1: { type: 'string', example: 'valor' }
  }
}
```

### 3. Pronto!

A documentação aparecerá automaticamente no Swagger UI.

## 📝 Exemplo de Uso

### Testar endpoint via Swagger

1. Acesse http://localhost:3000/api-docs (ou /br)
2. Clique em "🔐 Session Management"
3. Clique em "POST /sessions/{sessionId}/init"
4. Clique "Try it out"
5. Preencha `sessionId: "teste"`
6. Clique "Execute"

## 🎨 Personalização

Edite `src/app.ts` para customizar:

```typescript
swaggerUi.setup(swaggerSpecEN, {
  customSiteTitle: 'Seu Título',
  customCss: '.swagger-ui .topbar { display: none }',
  customfavIcon: '/favicon.ico'
})
```

## 🔗 Links Úteis

- **Swagger UI**: https://swagger.io/tools/swagger-ui/
- **OpenAPI Spec**: https://swagger.io/specification/
- **YAML Syntax**: https://yaml.org/spec/1.2/spec.html

---

**Estrutura criada por**: Claude Code
**Data**: 2025-10-01
