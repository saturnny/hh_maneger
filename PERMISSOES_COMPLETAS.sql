-- =================================================================
-- PERMISSÕES COMPLETAS PARA TODAS AS TABELAS
-- Execute este script no Supabase SQL Editor
-- =================================================================

-- 1. REMOVER TODAS AS POLÍTICAS RLS EXISTENTES
DROP POLICY IF EXISTS "Enable read access for all users" ON usuarios;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON usuarios;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON usuarios;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON usuarios;

DROP POLICY IF EXISTS "Enable read access for all users" ON atividades;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON atividades;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON atividades;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON atividades;

DROP POLICY IF EXISTS "Enable read access for all users" ON categorias;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON categorias;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON categorias;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON categorias;

DROP POLICY IF EXISTS "Enable read access for all users" ON lancamentos;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON lancamentos;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON lancamentos;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON lancamentos;

-- 2. DESABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE atividades DISABLE ROW LEVEL SECURITY;
ALTER TABLE categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos DISABLE ROW LEVEL SECURITY;

-- 3. CONCEDER PERMISSÕES COMPLETAS PARA TODOS OS ROLES

-- Permissões para 'authenticated' (usuários logados)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Permissões para 'service_role' (serviços backend)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Permissões para 'anon' (público, apenas leitura)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- 4. GARANTIR QUE O ROLE 'authenticated' TENHA AS PERMISSÕES
-- (Isso garante que usuários logados via NextAuth tenham acesso total)

-- 6. VERIFICAÇÃO DAS PERMISSÕES CONCEDIDAS

SELECT 
    table_schema,
    table_name,
    grantee,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public'
ORDER BY table_name, grantee, privilege_type;

-- 6. VERIFICAÇÃO DO STATUS DO RLS

SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('usuarios', 'atividades', 'categorias', 'lancamentos')
ORDER BY tablename;

-- 7. VERIFICAÇÃO DE USUÁRIOS EXISTENTES (para debug)
SELECT 
    id,
    nome,
    email,
    tipo_usuario,
    ativo,
    created_at
FROM usuarios 
ORDER BY created_at DESC 
LIMIT 5;

-- =================================================================
-- RESUMO DAS AÇÕES EXECUTADAS
-- =================================================================
-- 
-- Este script irá:
-- 1. Remover todas as políticas RLS existentes
-- 2. Desabilitar RLS em todas as tabelas principais
-- 3. Conceder permissões completas para authenticated, service_role e anon
-- 4. Verificar se as permissões foram aplicadas corretamente
-- 5. Listar usuários existentes para verificação
-- 
-- Após executar este script:
-- - Usuários logados terão acesso total às tabelas
-- - APIs do NextAuth funcionarão sem erros de permissão
-- - Sistema de CRUD completo funcionará
-- =================================================================
