import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from') || new Date().toISOString().split('T')[0]
    const to = searchParams.get('to') || new Date().toISOString().split('T')[0]
    const usuario = searchParams.get('usuario') || ''
    const atividade = searchParams.get('atividade') || ''

    let query = supabaseServer
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
      .gte('data', from)
      .lte('data', to)
      .order('data', { ascending: false })
      .order('hora_inicio', { ascending: false })

    if (usuario) {
      query = query.eq('usuario_id', usuario)
    }

    if (atividade) {
      query = query.eq('atividade_id', atividade)
    }

    const { data: lancamentos, error } = await query

    console.log('API - Lançamentos encontrados:', lancamentos)

    if (error) {
      console.error('Erro ao buscar lançamentos:', error)
      return NextResponse.json({ error: 'Erro ao buscar lançamentos' }, { status: 500 })
    }

    return NextResponse.json({ lancamentos })
  } catch (error) {
    console.error('Erro ao buscar lançamentos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
