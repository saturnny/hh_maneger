# 🚨 COMO RESOLVER O ERRO "permission denied"

## 📋 Problema Identificado
O erro `permission denied for table atividades` indica que o usuário autenticado não tem permissão para acessar a tabela `atividades` no Supabase.

## 🔧 SOLUÇÃO COMPLETA

### 1. Execute o Script de Permissões
Copie e cole todo o conteúdo do arquivo `PERMISSOES_COMPLETAS.sql` no SQL Editor do Supabase:

```sql
-- Execute este script no Supabase SQL Editor
-- =================================================================
-- PERMISSÕES COMPLETAS PARA TODAS AS TABELAS
-- =================================================================
```

### 2. Passos para Executar

1. **Acesse o Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Cole todo o script** `PERMISSOES_COMPLETAS.sql`
4. **Clique em "RUN"** ou execute o script
5. **Aguarde o resultado** - deve mostrar "Query executed successfully"

### 3. Reinicie a Aplicação
```bash
npm run dev
```

## 📝 O que o Script Faz

### ✅ Remove Políticas Conflitantes
- Apaga todas as políticas RLS existentes que podem estar bloqueando acesso

### ✅ Desabilita RLS Completamente
- `ALTER TABLE ... DISABLE ROW LEVEL SECURITY`
- Remove qualquer restrição de linha

### ✅ Concede Permissões Totais
- **authenticated**: Acesso total para usuários logados
- **service_role**: Acesso total para serviços
- **anon**: Acesso apenas leitura para público

### ✅ Verificação Automática
- Mostra se as permissões foram aplicadas
- Lista usuários existentes

## 🎯 Resultado Esperado

Após executar o script:

1. ✅ **Login funciona** sem erros de permissão
2. ✅ **CRUD de atividades** funciona completamente
3. ✅ **CRUD de categorias** funciona completamente
4. ✅ **CRUD de usuários** funciona completamente
5. ✅ **CRUD de lançamentos** funciona completamente

## ⚠️ Se o Erro Persistir

Se após executar o script o erro continuar:

1. **Verifique se o script executou completamente**
2. **Reinicie o servidor Next.js**
3. **Limpe o cache do navegador** (Ctrl+F5)
4. **Verifique as permissões no painel do Supabase**

## 🔍 Verificação Manual

Você pode verificar as permissões atuais com:

```sql
SELECT 
    schemaname,
    tablename,
    grantee,
    privilege_type
FROM information_schema.role_table_grants 
WHERE schemaname = 'public'
AND tablename IN ('usuarios', 'atividades', 'categorias', 'lancamentos')
ORDER BY tablename, grantee, privilege_type;
```

## 📞 Suporte

O script `PERMISSOES_COMPLETAS.sql` contém tudo o necessário para resolver o problema de permissão de uma vez por todas.

**Execute-o agora e teste novamente!** 🚀
