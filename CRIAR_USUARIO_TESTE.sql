-- =================================================================
-- CRIAR USUÁRIO DE TESTE (user@teste.com)
-- Execute este script no Supabase SQL Editor
-- =================================================================

-- 1. VERIFICAR SE USUÁRIO JÁ EXISTE
SELECT id, nome, email, tipo_usuario, ativo 
FROM usuarios 
WHERE email = 'user@teste.com';

-- 2. CRIAR USUÁRIO DE TESTE (se não existir)
INSERT INTO usuarios (
    nome,
    email,
    senha,
    tipo_usuario,
    ativo,
    gestao,
    area,
    equipe,
    especialidade,
    created_at,
    updated_at
) VALUES (
    'Usuário Teste',
    'user@teste.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pkyldJaxG9R/B7vK86YkJ36', -- hash para 'user123'
    'Usuario',
    true,
    NULL,
    NULL,
    NULL,
    NULL,
    NOW(),
    NOW()
);

-- 3. VERIFICAR USUÁRIO CRIADO
SELECT id, nome, email, tipo_usuario, ativo 
FROM usuarios 
WHERE email = 'user@teste.com';

-- 4. LISTAR TODOS OS USUÁRIOS (para verificação)
SELECT 
    id,
    nome,
    email,
    tipo_usuario,
    ativo,
    gestao,
    area,
    equipe,
    especialidade,
    created_at
FROM usuarios 
ORDER BY created_at DESC;

-- =================================================================
-- INSTRUÇÕES:
-- 
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Verifique se o usuário foi criado corretamente
-- 3. Teste o login com:
--    - Email: user@teste.com
--    - Senha: user123
-- 4. Verifique se aparece como "Usuário" (não "Admin")
-- =================================================================
