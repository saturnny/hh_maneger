require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

async function testCamposCompletos() {
  try {
    console.log('Testando criação com todos os campos...')
    
    const { data: newUser, error } = await supabaseAdmin
      .from('usuarios')
      .insert({
        nome: 'Teste Campos Completos',
        email: `testcompleto${Date.now()}@example.com`,
        senha: 'hashedpassword',
        tipo_usuario: 'Usuário',
        ativo: true,
        gestao: 'TI',
        area: 'Desenvolvimento',
        equipe: 'Equipe Alpha',
        especialidade: 'Frontend'
      })
      .select(`
        id,
        nome,
        email,
        tipo_usuario,
        ativo,
        gestao,
        area,
        equipe,
        especialidade
      `)
      .single()
    
    if (error) {
      console.error('Erro na criação:', error)
      return
    }
    
    console.log('✅ Usuário criado com todos os campos:', newUser)
    
    // Limpar
    await supabaseAdmin
      .from('usuarios')
      .delete()
      .eq('id', newUser.id)
    
    console.log('✅ Usuário de teste removido')
    
  } catch (error) {
    console.error('Erro no teste:', error)
  }
}

testCamposCompletos()
