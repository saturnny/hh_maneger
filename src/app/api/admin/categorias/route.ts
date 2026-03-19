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

    const { data: categorias, error } = await supabaseServer
      .from('categorias')
      .select(`
        id,
        nome,
        descricao,
        ativo,
        atividades(count)
      `)
      .order('nome')

    console.log('API - Categorias encontradas:', categorias)

    if (error) {
      console.error('Erro ao buscar categorias:', error)
      return NextResponse.json({ error: 'Erro ao buscar categorias' }, { status: 500 })
    }

    return NextResponse.json({ categorias })
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
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
    const { nome, descricao } = body

    // Validar campos obrigatórios
    if (!nome) {
      return NextResponse.json({ error: 'Nome da categoria é obrigatório' }, { status: 400 })
    }

    // Verificar se categoria já existe
    const { data: existingCategoria } = await supabaseServer
      .from('categorias')
      .select('id')
      .eq('nome', nome)
      .single()

    if (existingCategoria) {
      console.error('Categoria já existe:', existingCategoria)
      return NextResponse.json({ error: 'Categoria já existe' }, { status: 400 })
    }

    console.log('Verificação de duplicidade concluída, nova categoria:', nome)

    // Criar categoria
    const { data: categoria, error } = await supabaseServer
      .from('categorias')
      .insert({
        nome,
        descricao: descricao || null,
        ativo: true
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar categoria:', error)
      return NextResponse.json({ error: 'Erro ao criar categoria' }, { status: 500 })
    }

    console.log('Categoria criada com sucesso:', categoria)

    return NextResponse.json({ 
      message: 'Categoria criada com sucesso',
      categoria
    })

  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
