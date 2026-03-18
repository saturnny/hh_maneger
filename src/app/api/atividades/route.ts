import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabase/server'
import { z } from 'zod'

const createAtividadeSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  descricao: z.string().optional(),
  categoria_id: z.number().int().positive('Categoria ID deve ser um número positivo'),
})

const updateAtividadeSchema = z.object({
  nome: z.string().min(2).optional(),
  descricao: z.string().optional(),
  categoria_id: z.number().int().positive().optional(),
  ativo: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const categoriaId = searchParams.get('categoria_id')
    const ativo = searchParams.get('ativo')

    let query = supabaseServer
      .from('atividades')
      .select(`
        *,
        categorias (
          id,
          nome
        )
      `, { count: 'exact' })

    if (categoriaId) {
      query = query.eq('categoria_id', parseInt(categoriaId))
    }

    if (ativo !== null && ativo !== undefined) {
      query = query.eq('ativo', ativo === 'true')
    }

    const { data: atividades, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      atividades,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        pages: Math.ceil((count || 0) / pageSize)
      }
    })
  } catch (error) {
    console.error('Erro ao buscar atividades:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createAtividadeSchema.parse(body)

    // Verificar se categoria existe
    const { data: categoria, error: categoriaError } = await supabaseServer
      .from('categorias')
      .select('id')
      .eq('id', validatedData.categoria_id)
      .eq('ativo', true)
      .single()

    if (categoriaError || !categoria) {
      return NextResponse.json({ error: 'Categoria não encontrada ou inativa' }, { status: 400 })
    }

    const { data: atividade, error } = await supabaseServer
      .from('atividades')
      .insert({
        ...validatedData,
        ativo: true,
      })
      .select(`
        *,
        categorias (
          id,
          nome
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(atividade, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Erro ao criar atividade:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
