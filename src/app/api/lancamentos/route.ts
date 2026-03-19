import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { z } from 'zod'
import { WORKDAY_START, WORKDAY_END, MINUTE_STEP, TARGET_HOURS } from '@/lib/time'

const createLancamentoSchema = z.object({
  usuario_id: z.number().int().positive().optional(),
  atividade_id: z.number().int().positive(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Hora inválida'),
  hora_fim: z.string().regex(/^\d{2}:\d{2}$/, 'Hora inválida'),
  descricao: z.string().optional(),
})

const updateLancamentoSchema = z.object({
  atividade_id: z.number().int().positive().optional(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida').optional(),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Hora inválida').optional(),
  hora_fim: z.string().regex(/^\d{2}:\d{2}$/, 'Hora inválida').optional(),
  descricao: z.string().optional(),
})

function isValidTimeFormat(time: string): boolean {
  const [hours, minutes] = time.split(':').map(Number)
  if (isNaN(hours) || isNaN(minutes)) return false
  if (hours < 0 || hours > 23) return false
  if (minutes < 0 || minutes > 59) return false
  if (minutes % MINUTE_STEP !== 0) return false
  return true
}

function isWithinWorkHours(time: string): boolean {
  if (!isValidTimeFormat(time)) return false
  
  const [hours, minutes] = time.split(':').map(Number)
  const [startHours, startMinutes] = WORKDAY_START.split(':').map(Number)
  const [endHours, endMinutes] = WORKDAY_END.split(':').map(Number)
  
  const timeMinutes = hours * 60 + minutes
  const startMinutesTotal = startHours * 60 + startMinutes
  const endMinutesTotal = endHours * 60 + endMinutes
  
  return timeMinutes >= startMinutesTotal && timeMinutes <= endMinutesTotal
}

function calculateDuration(startTime: string, endTime: string): number {
  const [startHours, startMinutes] = startTime.split(':').map(Number)
  const [endHours, endMinutes] = endTime.split(':').map(Number)
  
  const startMinutesTotal = startHours * 60 + startMinutes
  const endMinutesTotal = endHours * 60 + endMinutes
  
  if (endMinutesTotal <= startMinutesTotal) return 0
  
  const durationMinutes = endMinutesTotal - startMinutesTotal
  return Math.round((durationMinutes / 60) * 10) / 10
}

async function checkTimeOverlap(
  userId: number,
  date: string,
  startTime: string,
  endTime: string,
  excludeId?: number
): Promise<boolean> {
  const query = supabaseServer
    .from('lancamentos')
    .select('id, hora_inicio, hora_fim')
    .eq('usuario_id', userId)
    .eq('data', date)

  if (excludeId) {
    query.neq('id', excludeId)
  }

  const { data: existingLancamentos } = await query

  if (!existingLancamentos) return false

  for (const lancamento of existingLancamentos) {
    const existingStart = lancamento.hora_inicio
    const existingEnd = lancamento.hora_fim

    // Verificar sobreposição: (start1 < end2) AND (end1 > start2)
    if (startTime < existingEnd && endTime > existingStart) {
      return true
    }
  }

  return false
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const usuarioId = searchParams.get('usuario_id')
    const atividadeId = searchParams.get('atividade_id')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const q = searchParams.get('q')

    let query = supabaseServer
      .from('lancamentos')
      .select(`
        *,
        usuarios (
          id,
          nome,
          email
        ),
        atividades (
          id,
          nome,
          categorias (
            id,
            nome
          )
        )
      `, { count: 'exact' })

    // Se não for admin, só pode ver seus próprios lançamentos
    if (session.user.role !== 'ADMIN') {
      query = query.eq('usuario_id', parseInt(session.user.id))
    } else if (usuarioId) {
      query = query.eq('usuario_id', parseInt(usuarioId))
    }

    if (atividadeId) {
      query = query.eq('atividade_id', parseInt(atividadeId))
    }

    if (from) {
      query = query.gte('data', from)
    }

    if (to) {
      query = query.lte('data', to)
    }

    if (q) {
      query = query.or(`descricao.ilike.%${q}%,usuarios.nome.ilike.%${q}%`)
    }

    const { data: lancamentos, error, count } = await query
      .order('data', { ascending: false })
      .order('hora_inicio', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      lancamentos,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        pages: Math.ceil((count || 0) / pageSize)
      }
    })
  } catch (error) {
    console.error('Erro ao buscar lançamentos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    let validatedData = createLancamentoSchema.parse(body)

    // Usuário só pode criar lançamentos para si mesmo
    if (session.user.role !== 'ADMIN') {
      validatedData.usuario_id = parseInt(session.user.id)
    }

    // Validações de horário
    if (!isValidTimeFormat(validatedData.hora_inicio) || !isValidTimeFormat(validatedData.hora_fim)) {
      return NextResponse.json({ error: 'Formato de hora inválido' }, { status: 400 })
    }

    if (!isWithinWorkHours(validatedData.hora_inicio) || !isWithinWorkHours(validatedData.hora_fim)) {
      return NextResponse.json({ 
        error: `Horário deve estar entre ${WORKDAY_START} e ${WORKDAY_END}` 
      }, { status: 400 })
    }

    if (validatedData.hora_inicio >= validatedData.hora_fim) {
      return NextResponse.json({ error: 'Hora fim deve ser maior que hora início' }, { status: 400 })
    }

    // Verificar sobreposição
    const hasOverlap = await checkTimeOverlap(
      validatedData.usuario_id!,
      validatedData.data,
      validatedData.hora_inicio,
      validatedData.hora_fim
    )

    if (hasOverlap) {
      return NextResponse.json({ error: 'Conflito: há lançamento sobreposto' }, { status: 400 })
    }

    // Verificar se atividade existe
    const { data: atividade, error: atividadeError } = await supabaseServer
      .from('atividades')
      .select('id')
      .eq('id', validatedData.atividade_id)
      .eq('ativo', true)
      .single()

    if (atividadeError || !atividade) {
      return NextResponse.json({ error: 'Atividade não encontrada ou inativa' }, { status: 400 })
    }

    // Calcular horas trabalhadas
    const horasTrabalhadas = calculateDuration(validatedData.hora_inicio, validatedData.hora_fim)
    const horasPendentes = Math.max(0, TARGET_HOURS - horasTrabalhadas)

    const { data: lancamento, error } = await supabaseAdmin
      .from('lancamentos')
      .insert({
        ...validatedData,
        horas_trabalhadas: horasTrabalhadas,
        horas_pendentes: horasPendentes,
      })
      .select(`
        *,
        usuarios (
          id,
          nome,
          email
        ),
        atividades (
          id,
          nome,
          categorias (
            id,
            nome
          )
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(lancamento, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Erro ao criar lançamento:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
