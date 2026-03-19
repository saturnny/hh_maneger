import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const createUsuarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  tipo_usuario: z.enum(['Admin', 'Administrador', 'Usuário']),
  gestao: z.string().optional(),
  area: z.string().optional(),
  equipe: z.string().optional(),
  especialidade: z.string().optional(),
})

const updateUsuarioSchema = z.object({
  nome: z.string().min(2).optional(),
  email: z.string().email().optional(),
  senha: z.string().min(6).optional(),
  tipo_usuario: z.enum(['Admin', 'Administrador', 'Usuário']).optional(),
  ativo: z.boolean().optional(),
  gestao: z.string().optional(),
  area: z.string().optional(),
  equipe: z.string().optional(),
  especialidade: z.string().optional(),
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
    const q = searchParams.get('q') || ''
    const tipo = searchParams.get('tipo') || ''

    let query = supabaseServer
      .from('usuarios')
      .select('*', { count: 'exact' })

    if (q) {
      query = query.or(`nome.ilike.%${q}%,email.ilike.%${q}%`)
    }

    if (tipo) {
      query = query.eq('tipo_usuario', tipo)
    }

    const { data: usuarios, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      usuarios,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        pages: Math.ceil((count || 0) / pageSize)
      }
    })
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
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
    const validatedData = createUsuarioSchema.parse(body)

    // Verificar se email já existe
    const { data: existingUser } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('email', validatedData.email)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 })
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(validatedData.senha, 10)

    const { data: usuario, error } = await supabaseAdmin
      .from('usuarios')
      .insert({
        ...validatedData,
        senha: hashedPassword,
        ativo: true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Remover senha do retorno
    const { senha, ...usuarioSemSenha } = usuario

    return NextResponse.json(usuarioSemSenha, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
