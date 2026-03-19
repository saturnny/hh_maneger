import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: usuarios, error } = await supabaseServer
      .from('usuarios')
      .select(`
        id,
        nome,
        email,
        tipo_usuario,
        ativo,
        gestao,
        area,
        equipe,
        especialidade
      `)
      .order('nome')

    console.log('API - Usuários encontrados:', usuarios)

    if (error) {
      console.error('Erro ao buscar usuários:', error)
      return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 })
    }

    return NextResponse.json({ usuarios })
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
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
    const { nome, email, password, tipo_usuario, gestao, area, equipe, especialidade } = body

    // Validar campos obrigatórios
    if (!nome || !email || !password || !tipo_usuario) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 })
    }

    // Verificar se email já existe
    const { data: existingUser } = await supabaseServer
      .from('usuarios')
      .select('email')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 })
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10)

    // Criar usuário
    const { data: usuario, error } = await supabaseServer
      .from('usuarios')
      .insert({
        nome,
        email,
        senha: hashedPassword,
        tipo_usuario,
        ativo: true,
        gestao: gestao || null,
        area: area || null,
        equipe: equipe || null,
        especialidade: especialidade || null
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar usuário:', error)
      return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
    }

    console.log('Usuário criado com sucesso:', usuario)

    return NextResponse.json({ 
      message: 'Usuário criado com sucesso',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario,
        ativo: usuario.ativo,
        gestao: usuario.gestao,
        area: usuario.area,
        equipe: usuario.equipe,
        especialidade: usuario.especialidade
      }
    })

  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
