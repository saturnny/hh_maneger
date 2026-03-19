# Validação do Banco de Dados - QualiDados

## 🔍 Problema Identificado

Não tenho acesso direto ao seu Supabase, mas posso validar a estrutura através das APIs do aplicativo.

## ✅ APIs Criadas para Admin

### 1. **Usuários** - CRUD Completo
- **GET** `/api/admin/usuarios` - Lista todos os usuários
- **POST** `/api/admin/usuarios` - Cria novo usuário
- **PUT** `/api/admin/usuarios/[id]` - Ativa/Desativa usuário
- **DELETE** `/api/admin/usuarios/[id]` - Exclui usuário

**Campos suportados:**
```typescript
{
  nome: string,           // ✅ Obrigatório
  email: string,          // ✅ Obrigatório, único
  password: string,       // ✅ Obrigatório (hash automático)
  tipo_usuario: string,   // ✅ Obrigatório ('Admin' | 'Usuário')
  gestao: string,         // ✅ Opcional
  area: string,           // ✅ Opcional
  equipe: string,         // ✅ Opcional
  especialidade: string   // ✅ Opcional
}
```

### 2. **Categorias** - CRUD Completo
- **GET** `/api/admin/categorias` - Lista categorias
- **POST** `/api/admin/categorias` - Cria nova categoria
- **PUT** `/api/admin/categorias/[id]` - Atualiza categoria
- **DELETE** `/api/admin/categorias/[id]` - Exclui categoria

**Campos suportados:**
```typescript
{
  nome: string,      // ✅ Obrigatório, único
  descricao: string  // ✅ Opcional
}
```

### 3. **Atividades** - CRUD Completo
- **GET** `/api/admin/atividades` - Lista atividades
- **POST** `/api/admin/atividades` - Cria nova atividade
- **PUT** `/api/admin/atividades/[id]` - Atualiza atividade
- **DELETE** `/api/admin/atividades/[id]` - Exclui atividade

**Campos suportados:**
```typescript
{
  nome: string,         // ✅ Obrigatório
  descricao: string,    // ✅ Opcional
  categoria_id: number  // ✅ Obrigatório (deve existir)
}
```

## 🧪 Como Validar

### 1. **Teste via Console do Navegador**
```javascript
// Testar API de usuários
fetch('/api/admin/usuarios')
  .then(res => res.json())
  .then(data => console.log('Usuários:', data))

// Testar criação de usuário
fetch('/api/admin/usuarios', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: 'Teste Admin',
    email: 'teste@teste.com',
    password: '123456',
    tipo_usuario: 'Admin',
    gestao: 'TI',
    area: 'Desenvolvimento',
    equipe: 'Backend',
    especialidade: 'Node.js'
  })
})
```

### 2. **Teste via Interface**
1. Faça login como `adm@teste.com` / `adm123`
2. Acesse `/admin/usuarios`
3. Clique em "Novo Usuário"
4. Preencha todos os campos
5. Teste criação

### 3. **Verificar no Supabase**
- Acesse seu painel Supabase
- Vá em Table Editor
- Verifique a tabela `usuarios`
- Confirme se os campos foram preenchidos

## 🚨 Possíveis Problemas

1. **Permissões no Supabase**
   - Execute o SQL `liberar-todas-tabelas.sql`
   - Verifique se as permissões foram aplicadas

2. **Campos Faltando**
   - Verifique se a tabela `usuarios` tem todos os campos
   - Compare com o schema em `database-schema.sql`

3. **API Keys Inválidas**
   - Verifique `.env.local`
   - Confirme `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`

## 📋 Checklist de Validação

- [ ] Login admin funciona
- [ ] Dashboard admin carrega
- [ ] Menu admin aparece
- [ ] Criar usuário novo
- [ ] Editar usuário existente
- [ ] Excluir usuário
- [ ] Criar categoria nova
- [ ] Criar atividade nova
- [ ] Dados persistem no Supabase

## 🔄 Se Não Funcionar

1. **Execute o SQL:** `liberar-todas-tabelas.sql`
2. **Reinicie o servidor:** `npm run dev`
3. **Limpe o cache:** Ctrl+F5 no navegador
4. **Verifique o console** para erros
