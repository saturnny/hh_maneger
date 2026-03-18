import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: lancamento, error } = await supabaseServer
      .from('lancamentos')
      .select(`
        id,
        data,
        hora_inicio,
        hora_fim,
        descricao,
        horas_trabalhadas,
        usuarios (
          id,
          nome,
          email
        ),
        atividades (
          id,
          nome,
          categorias (
            nome
          )
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Erro ao buscar lançamento:', error)
      return NextResponse.json({ error: 'Erro ao buscar lançamento' }, { status: 500 })
    }

    return NextResponse.json(lancamento)
  } catch (error) {
    console.error('Erro ao buscar lançamento:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { error } = await supabaseServer
      .from('lancamentos')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Erro ao excluir lançamento:', error)
      return NextResponse.json({ error: 'Erro ao excluir lançamento' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Lançamento excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir lançamento:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
