import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
  console.log('🌱 Iniciando seed de dados...')

  try {
    // 1. Criar usuários
    console.log('📝 Criando usuários...')
    
    const adminPassword = await bcrypt.hash('Admin@123', 10)
    const userPassword = await bcrypt.hash('Usuario@123', 10)

    const { data: existingUsers } = await supabase
      .from('usuarios')
      .select('email')

    const existingEmails = existingUsers?.map(u => u.email) || []

    if (!existingEmails.includes('admin@qualificados.com')) {
      await supabase
        .from('usuarios')
        .insert({
          nome: 'Administrador Sistema',
          email: 'admin@qualificados.com',
          senha: adminPassword,
          tipo_usuario: 'Admin',
          ativo: true
        })
      console.log('✅ Administrador criado')
    } else {
      console.log('ℹ️ Administrador já existe')
    }

    if (!existingEmails.includes('adm@teste.com')) {
      const admTestePassword = await bcrypt.hash('adm123', 10)
      await supabase
        .from('usuarios')
        .insert({
          nome: 'Administrador Teste',
          email: 'adm@teste.com',
          senha: admTestePassword,
          tipo_usuario: 'Admin',
          ativo: true
        })
      console.log('✅ Administrador Teste criado')
    } else {
      console.log('ℹ️ Administrador Teste já existe')
    }

    if (!existingEmails.includes('user@teste.com')) {
      const userTestePassword = await bcrypt.hash('user123', 10)
      await supabase
        .from('usuarios')
        .insert({
          nome: 'Usuário Teste',
          email: 'user@teste.com',
          senha: userTestePassword,
          tipo_usuario: 'Usuário',
          ativo: true
        })
      console.log('✅ Usuário Teste criado')
    } else {
      console.log('ℹ️ Usuário Teste já existe')
    }

    if (!existingEmails.includes('usuario@qualidados.com')) {
      await supabase
        .from('usuarios')
        .insert({
          nome: 'Uelton Bispo de Almeida',
          email: 'usuario@qualidados.com',
          senha: userPassword,
          tipo_usuario: 'Usuário',
          ativo: true,
          gestao: 'Rotina',
          area: 'Núcleo',
          equipe: 'Planejamento',
          especialidade: 'Indicadores'
        })
      console.log('✅ Usuário criado')
    } else {
      console.log('ℹ️ Usuário já existe')
    }

    // 2. Criar categorias
    console.log('📁 Criando categorias...')
    
    const { data: existingCategorias } = await supabase
      .from('categorias')
      .select('nome')

    const existingCategoriaNames = existingCategorias?.map(c => c.nome) || []

    const categorias = [
      { nome: 'Desenvolvimento', descricao: 'Atividades de desenvolvimento de software' },
      { nome: 'Reunião', descricao: 'Reuniões internas e com clientes' },
      { nome: 'Estudo', descricao: 'Estudos e capacitação' },
      { nome: 'Planejamento', descricao: 'Planejamento de atividades e projetos' },
      { nome: 'Suporte', descricao: 'Suporte técnico e manutenção' },
      { nome: 'Documentação', descricao: 'Elaboração de documentação' }
    ]

    for (const categoria of categorias) {
      if (!existingCategoriaNames.includes(categoria.nome)) {
        await supabase
          .from('categorias')
          .insert(categoria)
        console.log(`✅ Categoria "${categoria.nome}" criada`)
      } else {
        console.log(`ℹ️ Categoria "${categoria.nome}" já existe`)
      }
    }

    // 3. Obter IDs das categorias
    const { data: categoriasData } = await supabase
      .from('categorias')
      .select('id, nome')

    const categoriaMap = new Map(
      categoriasData?.map(c => [c.nome, c.id]) || []
    )

    // 4. Criar atividades
    console.log('🎯 Criando atividades...')
    
    const { data: existingAtividades } = await supabase
      .from('atividades')
      .select('nome')

    const existingAtividadeNames = existingAtividades?.map(a => a.nome) || []

    const atividades = [
      { nome: 'Desenvolvimento Frontend', categoria_id: categoriaMap.get('Desenvolvimento') },
      { nome: 'Desenvolvimento Backend', categoria_id: categoriaMap.get('Desenvolvimento') },
      { nome: 'Reunião de Equipe', categoria_id: categoriaMap.get('Reunião') },
      { nome: 'Reunião com Cliente', categoria_id: categoriaMap.get('Reunião') },
      { nome: 'Estudo de Node.js', categoria_id: categoriaMap.get('Estudo') },
      { nome: 'Estudo de React', categoria_id: categoriaMap.get('Estudo') },
      { nome: 'Planejamento Sprint', categoria_id: categoriaMap.get('Planejamento') },
      { nome: 'Suporte Técnico', categoria_id: categoriaMap.get('Suporte') },
      { nome: 'Documentação API', categoria_id: categoriaMap.get('Documentação') }
    ]

    for (const atividade of atividades) {
      if (!existingAtividadeNames.includes(atividade.nome)) {
        await supabase
          .from('atividades')
          .insert(atividade)
        console.log(`✅ Atividade "${atividade.nome}" criada`)
      } else {
        console.log(`ℹ️ Atividade "${atividade.nome}" já existe`)
      }
    }

    // 5. Obter IDs dos usuários e atividades
    const { data: usuariosData } = await supabase
      .from('usuarios')
      .select('id, email')

    const { data: atividadesData } = await supabase
      .from('atividades')
      .select('id, nome')

    const usuarioMap = new Map(
      usuariosData?.map(u => [u.email, u.id]) || []
    )

    const atividadeMap = new Map(
      atividadesData?.map(a => [a.nome, a.id]) || []
    )

    // 6. Criar lançamentos de exemplo
    console.log('⏰ Criando lançamentos de exemplo...')
    
    const { data: existingLancamentos } = await supabase
      .from('lancamentos')
      .select('data')

    if (!existingLancamentos || existingLancamentos.length === 0) {
      const today = new Date().toISOString().split('T')[0]
      const userId = usuarioMap.get('usuario@qualidados.com')
      
      const lancamentos = [
        {
          usuario_id: userId,
          atividade_id: atividadeMap.get('Desenvolvimento Frontend'),
          data: today,
          hora_inicio: '07:00',
          hora_fim: '08:30',
          descricao: 'Desenvolvimento de componentes React',
          horas_trabalhadas: 1.5,
          horas_pendentes: 7.5
        },
        {
          usuario_id: userId,
          atividade_id: atividadeMap.get('Reunião de Equipe'),
          data: today,
          hora_inicio: '08:30',
          hora_fim: '09:15',
          descricao: 'Daily meeting e planejamento do dia',
          horas_trabalhadas: 0.75,
          horas_pendentes: 6.75
        },
        {
          usuario_id: userId,
          atividade_id: atividadeMap.get('Desenvolvimento Backend'),
          data: today,
          hora_inicio: '09:15',
          hora_fim: '11:00',
          descricao: 'Implementação de APIs REST',
          horas_trabalhadas: 1.75,
          horas_pendentes: 5.0
        }
      ]

      for (const lancamento of lancamentos) {
        await supabase
          .from('lancamentos')
          .insert(lancamento)
      }
      
      console.log('✅ Lançamentos de exemplo criados')
    } else {
      console.log('ℹ️ Lançamentos já existem')
    }

    console.log('🎉 Seed concluído com sucesso!')
    console.log('')
    console.log('📋 Usuários criados:')
    console.log('👤 Admin: admin@qualidados.com / Admin@123')
    console.log('👤 Usuário: usuario@qualidados.com / Usuario@123')

  } catch (error) {
    console.error('❌ Erro no seed:', error)
    process.exit(1)
  }
}

seed()
