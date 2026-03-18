-- =================================================================
-- LIBERAR ACESSO COMPLETO A TODAS AS TABELAS DO SUPABASE
-- =================================================================

-- 1. Remover todas as RLS (Row Level Security) policies existentes
DROP POLICY IF EXISTS "usuarios_select_policy" ON usuarios;
DROP POLICY IF EXISTS "usuarios_insert_policy" ON usuarios;
DROP POLICY IF EXISTS "usuarios_update_policy" ON usuarios;
DROP POLICY IF EXISTS "usuarios_delete_policy" ON usuarios;

DROP POLICY IF EXISTS "atividades_select_policy" ON atividades;
DROP POLICY IF EXISTS "atividades_insert_policy" ON atividades;
DROP POLICY IF EXISTS "atividades_update_policy" ON atividades;
DROP POLICY IF EXISTS "atividades_delete_policy" ON atividades;

DROP POLICY IF EXISTS "categorias_select_policy" ON categorias;
DROP POLICY IF EXISTS "categorias_insert_policy" ON categorias;
DROP POLICY IF EXISTS "categorias_update_policy" ON categorias;
DROP POLICY IF EXISTS "categorias_delete_policy" ON categorias;

DROP POLICY IF EXISTS "lancamentos_select_policy" ON lancamentos;
DROP POLICY IF EXISTS "lancamentos_insert_policy" ON lancamentos;
DROP POLICY IF EXISTS "lancamentos_update_policy" ON lancamentos;
DROP POLICY IF EXISTS "lancamentos_delete_policy" ON lancamentos;

-- 2. Desabilitar RLS completamente em todas as tabelas
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE atividades DISABLE ROW LEVEL SECURITY;
ALTER TABLE categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos DISABLE ROW LEVEL SECURITY;

-- 3. Conceder todas as permissões para authenticated users
GRANT ALL ON TABLE usuarios TO authenticated;
GRANT ALL ON TABLE atividades TO authenticated;
GRANT ALL ON TABLE categorias TO authenticated;
GRANT ALL ON TABLE lancamentos TO authenticated;

-- 4. Conceder todas as permissões para service_role
GRANT ALL ON TABLE usuarios TO service_role;
GRANT ALL ON TABLE atividades TO service_role;
GRANT ALL ON TABLE categorias TO service_role;
GRANT ALL ON TABLE lancamentos TO service_role;

-- 5. Conceder permissões de leitura para anon users (opcional)
GRANT SELECT ON TABLE usuarios TO anon;
GRANT SELECT ON TABLE atividades TO anon;
GRANT SELECT ON TABLE categorias TO anon;
GRANT SELECT ON TABLE lancamentos TO anon;

-- 6. Conceder permissões nas sequências (auto-incrementos)
GRANT USAGE, SELECT ON SEQUENCE usuarios_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE atividades_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE categorias_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE lancamentos_id_seq TO authenticated;

GRANT USAGE, SELECT ON SEQUENCE usuarios_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE atividades_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE categorias_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE lancamentos_id_seq TO service_role;

-- 7. Conceder permissões em funções (se existirem)
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- =================================================================
-- VERIFICAÇÃO - Para confirmar que as permissões foram aplicadas
-- =================================================================

-- Verificar permissões da tabela usuarios
SELECT 
    table_name,
    privilege_type,
    grantee
FROM information_schema.role_table_grants 
WHERE table_name = 'usuarios'
ORDER BY grantee, privilege_type;

-- Verificar permissões da tabela atividades
SELECT 
    table_name,
    privilege_type,
    grantee
FROM information_schema.role_table_grants 
WHERE table_name = 'atividades'
ORDER BY grantee, privilege_type;

-- Verificar permissões da tabela categorias
SELECT 
    table_name,
    privilege_type,
    grantee
FROM information_schema.role_table_grants 
WHERE table_name = 'categorias'
ORDER BY grantee, privilege_type;

-- Verificar permissões da tabela lancamentos
SELECT 
    table_name,
    privilege_type,
    grantee
FROM information_schema.role_table_grants 
WHERE table_name = 'lancamentos'
ORDER BY grantee, privilege_type;

-- Verificar status do RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('usuarios', 'atividades', 'categorias', 'lancamentos')
ORDER BY tablename;

-- =================================================================
-- RESUMO DAS AÇÕES EXECUTADAS
-- =================================================================
-- Este script irá:
-- 1. Remover todas as políticas de RLS existentes
-- 2. Desabilitar RLS em todas as tabelas principais
-- 3. Conceder permissões totais (SELECT, INSERT, UPDATE, DELETE)
-- 4. Aplicar para authenticated e service_role
-- 5. Conceder permissões nas sequências de auto-incremento
-- 6. Conceder permissões de execução de funções
-- 7. Incluir queries para verificação das permissões aplicadas

-- Execute todo o script de uma vez no SQL Editor do Supabase
-- =================================================================
