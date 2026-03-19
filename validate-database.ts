import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function validateDatabase() {
  console.log('🔍 Validando estrutura do banco de dados...')

  try {
    // 1. Verificar se a tabela usuarios existe
    console.log('\n📋 Verificando tabela usuarios...')
    const { data: usuariosColumns, error: usuariosError } = await supabase
      .rpc('get_table_columns', { table_name: 'usuarios' })
    
    if (usuariosError) {
      console.error('❌ Erro ao verificar tabela usuarios:', usuariosError)
    } else {
      console.log('✅ Tabela usuarios encontrada')
      console.log('Colunas:', usuariosColumns?.map((c: any) => c.column_name))
    }

    // 2. Verificar se a tabela categorias existe
    console.log('\n📋 Verificando tabela categorias...')
    const { data: categoriasColumns, error: categoriasError } = await supabase
      .rpc('get_table_columns', { table_name: 'categorias' })
    
    if (categoriasError) {
      console.error('❌ Erro ao verificar tabela categorias:', categoriasError)
    } else {
      console.log('✅ Tabela categorias encontrada')
      console.log('Colunas:', categoriasColumns?.map((c: any) => c.column_name))
    }

    // 3. Verificar se a tabela atividades existe
    console.log('\n📋 Verificando tabela atividades...')
    const { data: atividadesColumns, error: atividadesError } = await supabase
      .rpc('get_table_columns', { table_name: 'atividades' })
    
    if (atividadesError) {
      console.error('❌ Erro ao verificar tabela atividades:', atividadesError)
    } else {
      console.log('✅ Tabela atividades encontrada')
      console.log('Colunas:', atividadesColumns?.map((c: any) => c.column_name))
    }

    // 4. Verificar se a tabela lancamentos existe
    console.log('\n📋 Verificando tabela lancamentos...')
    const { data: lancamentosColumns, error: lancamentosError } = await supabase
      .rpc('get_table_columns', { table_name: 'lancamentos' })
    
    if (lancamentosError) {
      console.error('❌ Erro ao verificar tabela lancamentos:', lancamentosError)
    } else {
      console.log('✅ Tabela lancamentos encontrada')
      console.log('Colunas:', lancamentosColumns?.map((c: any) => c.column_name))
    }

    // 5. Verificar usuários existentes
    console.log('\n👥 Verificando usuários existentes...')
    const { data: usuarios, error: usuariosListError } = await supabase
      .from('usuarios')
      .select('id, nome, email, tipo_usuario, ativo, gestao, area, equipe, especialidade')
      .order('id')

    if (usuariosListError) {
      console.error('❌ Erro ao listar usuários:', usuariosListError)
    } else {
      console.log('✅ Usuários encontrados:')
      usuarios?.forEach((user: any) => {
        console.log(`  - ${user.nome} (${user.email}) - ${user.tipo_usuario}`)
        console.log(`    Gestão: ${user.gestao || 'N/A'}`)
        console.log(`    Área: ${user.area || 'N/A'}`)
        console.log(`    Equipe: ${user.equipe || 'N/A'}`)
        console.log(`    Especialidade: ${user.especialidade || 'N/A'}`)
        console.log(`    Ativo: ${user.ativo ? 'Sim' : 'Não'}`)
        console.log('')
      })
    }

    // 6. Verificar categorias existentes
    console.log('\n📁 Verificando categorias existentes...')
    const { data: categorias, error: categoriasListError } = await supabase
      .from('categorias')
      .select('id, nome, descricao')

    if (categoriasListError) {
      console.error('❌ Erro ao listar categorias:', categoriasListError)
    } else {
      console.log('✅ Categorias encontradas:')
      categorias?.forEach((cat: any) => {
        console.log(`  - ${cat.nome}: ${cat.descricao || 'Sem descrição'}`)
      })
    }

    // 7. Verificar atividades existentes
    console.log('\n🎯 Verificando atividades existentes...')
    const { data: atividades, error: atividadesListError } = await supabase
      .from('atividades')
      .select('id, nome, descricao, categoria_id, categorias(nome)')

    if (atividadesListError) {
      console.error('❌ Erro ao listar atividades:', atividadesListError)
    } else {
      console.log('✅ Atividades encontradas:')
      atividades?.forEach((ativ: any) => {
        console.log(`  - ${ativ.nome}: ${ativ.descricao || 'Sem descrição'}`)
        console.log(`    Categoria: ${ativ.categorias?.nome || 'N/A'}`)
      })
    }

  } catch (error) {
    console.error('❌ Erro na validação:', error)
  }
}

validateDatabase()
