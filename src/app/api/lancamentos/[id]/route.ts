import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { z } from 'zod'

const updateLancamentoSchema = z.object({
  atividade_id: z.number().int().positive().optional(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida').optional(),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Hora inválida').optional(),
  hora_fim: z.string().regex(/^\d{2}:\d{2}$/, 'Hora inválida').optional(),
  descricao: z.string().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateLancamentoSchema.parse(body)

    const { data: lancamento, error: fetchError } = await supabaseServer
      .from('lancamentos')
      .select('usuario_id')
      .eq('id', Number(params.id))
      .single()

    if (fetchError || !lancamento) {
      return NextResponse.json({ error: 'Lançamento não encontrado' }, { status: 404 })
    }

    if (session.user.role !== 'ADMIN' && lancamento.usuario_id !== parseInt(session.user.id)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: updatedLancamento, error } = await supabaseAdmin
      .from('lancamentos')
      .update(validatedData)
      .eq('id', Number(params.id))
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(updatedLancamento)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Erro ao atualizar lançamento:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: lancamento, error: fetchError } = await supabaseServer
      .from('lancamentos')
      .select('usuario_id')
      .eq('id', Number(params.id))
      .single()

    if (fetchError || !lancamento) {
      return NextResponse.json({ error: 'Lançamento não encontrado' }, { status: 404 })
    }

    if (session.user.role !== 'ADMIN' && lancamento.usuario_id !== parseInt(session.user.id)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { error } = await supabaseAdmin
      .from('lancamentos')
      .delete()
      .eq('id', Number(params.id))

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Lançamento excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir lançamento:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
