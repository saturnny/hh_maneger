import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: atividades, error } = await supabaseServer
      .from('atividades')
      .select(`
        id,
        nome,
        descricao,
        categoria_id,
        ativo,
        categorias (
          id,
          nome
        )
      `)
      .order('nome')

    console.log('API - Atividades encontradas:', atividades)

    if (error) {
      console.error('Erro ao buscar atividades:', error)
      return NextResponse.json({ error: 'Erro ao buscar atividades' }, { status: 500 })
    }

    return NextResponse.json({ atividades })
  } catch (error) {
    console.error('Erro ao buscar atividades:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { nome, descricao, categoria_id } = body

    // Validar campos obrigatórios
    if (!nome || !categoria_id) {
      return NextResponse.json({ error: 'Nome e categoria são obrigatórios' }, { status: 400 })
    }

    // Verificar se categoria existe
    const { data: categoria, error: categoriaError } = await supabaseServer
      .from('categorias')
      .select('id')
      .eq('id', categoria_id)
      .single()

    if (categoriaError || !categoria) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 400 })
    }

    // Criar atividade
    const { data: atividade, error } = await supabaseServer
      .from('atividades')
      .insert({
        nome,
        descricao: descricao || null,
        categoria_id,
        ativo: true
      })
      .select(`
        id,
        nome,
        descricao,
        categoria_id,
        ativo,
        categorias (
          id,
          nome
        )
      `)
      .single()

    if (error) {
      console.error('Erro ao criar atividade:', error)
      return NextResponse.json({ error: 'Erro ao criar atividade' }, { status: 500 })
    }

    console.log('Atividade criada com sucesso:', atividade)

    return NextResponse.json({ 
      message: 'Atividade criada com sucesso',
      atividade
    })

  } catch (error) {
    console.error('Erro ao criar atividade:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
