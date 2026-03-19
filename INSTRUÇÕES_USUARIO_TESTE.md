# 👤 CRIAR USUÁRIO DE TESTE

## 📋 Objetivo
Criar usuário `user@teste.com` com senha `user123` para testar o sistema de cadastro e login.

## 🔧 Como Executar

### 1. Execute o Script SQL
1. **Abra o Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Copie e cole** todo o conteúdo de `CRIAR_USUARIO_TESTE.sql`
4. **Clique em RUN** para executar

### 2. Verifique o Resultado
O script irá mostrar:
- ✅ **Se usuário já existe** (consulta SELECT)
- ✅ **Criação do usuário** (INSERT)
- ✅ **Verificação final** (SELECT pós-criação)
- ✅ **Lista completa** (todos os usuários)

## 👤 Credenciais de Teste

```
Email: user@teste.com
Senha: user123
Tipo: Usuario
Status: Ativo
```

## 🎯 Após Criar o Usuário

### 1. Teste Login
1. **Acesse:** `http://localhost:3000/login`
2. **Use as credenciais:**
   - Email: `user@teste.com`
   - Senha: `user123`
3. **Deve redirecionar:** Para dashboard de usuário

### 2. Teste Cadastro via App
1. **Acesse:** `/admin/usuarios`
2. **Clique em:** "Novo Usuário"
3. **Preencha:** Formulário completo
4. **Verifique:** Se salva corretamente

### 3. Verifique Tipos
- ✅ **user@teste.com** deve aparecer como **"Usuario"**
- ✅ **adm@teste.com** deve aparecer como **"Administrador"**
- ✅ **Ambos devem conseguir** fazer login

## 🔍 Verificação no Banco

Após executar o script, você deve ver:

```sql
-- Consulta de verificação
id | nome           | email           | tipo_usuario | ativo
---|----------------|-----------------|--------------|------
  1 | Administrador  | adm@teste.com   | Admin         | t
  2 | Usuário Teste | user@teste.com  | Usuario       | t
```

## ⚠️ Importante

- **Hash da senha:** Já está pré-calculado para `user123`
- **Tipo correto:** `Usuario` (não "Usuário" com acento)
- **Permissões:** Script `PERMISSOES_CORRIGIDAS.sql` deve ser executado primeiro
- **RLS:** Deve estar desabilitado

## 🚀 Resultado Esperado

Após criar o usuário:
- ✅ **Login funciona** para ambos os usuários
- ✅ **Cadastro via app** funciona
- ✅ **Tipos consistentes** no frontend
- ✅ **Permissões corretas** para cada tipo

**Execute o script `CRIAR_USUARIO_TESTE.sql` agora!** 🎯
