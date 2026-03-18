import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabase/server'
import { TARGET_HOURS } from '@/lib/time'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'user-today'
    const usuarioId = searchParams.get('usuario_id')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    if (type === 'user-today') {
      // Métricas do usuário para hoje
      const today = new Date().toISOString().split('T')[0]
      const userId = session.user.role === 'ADMIN' && usuarioId 
        ? parseInt(usuarioId) 
        : parseInt(session.user.id)

      const { data: lancamentos, error } = await supabaseServer
        .from('lancamentos')
        .select('horas_trabalhadas')
        .eq('usuario_id', userId)
        .eq('data', today)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      const totalEntries = lancamentos?.length || 0
      const hoursAppropriated = lancamentos?.reduce((sum, lanc) => sum + (lanc.horas_trabalhadas || 0), 0) || 0
      const hoursPending = Math.max(0, TARGET_HOURS - hoursAppropriated)

      return NextResponse.json({
        totalEntries,
        hoursAppropriated,
        hoursPending
      })
    }

    if (type === 'admin' && session.user.role === 'ADMIN') {
      // Métricas para admin com filtros
      let query = supabaseServer
        .from('lancamentos')
        .select(`
          usuario_id,
          horas_trabalhadas,
          data,
          usuarios (
            id,
            nome
          )
        `)

      if (usuarioId) {
        query = query.eq('usuario_id', parseInt(usuarioId))
      }

      if (from) {
        query = query.gte('data', from)
      }

      if (to) {
        query = query.lte('data', to)
      }

      const { data: lancamentos, error } = await query

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      const totalEntries = lancamentos?.length || 0
      const totalHours = lancamentos?.reduce((sum, lanc) => sum + (lanc.horas_trabalhadas || 0), 0) || 0
      const activeUsers = new Set(lancamentos?.map(lanc => lanc.usuario_id)).size

      return NextResponse.json({
        totalEntries,
        totalHours,
        activeUsers
      })
    }

    return NextResponse.json({ error: 'Tipo de métrica inválido' }, { status: 400 })
  } catch (error) {
    console.error('Erro ao buscar métricas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
