import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 })
    }

    // Buscar usuário atual
    const { data: user, error: userError } = await supabaseServer
      .from('usuarios')
      .select('*')
      .eq('email', session.user.email)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.senha)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 })
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // Atualizar senha
    const { error: updateError } = await supabaseServer
      .from('usuarios')
      .update({ senha: hashedNewPassword })
      .eq('id', user.id)

    if (updateError) {
      console.error('Erro ao atualizar senha:', updateError)
      return NextResponse.json({ error: 'Erro ao atualizar senha' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Senha atualizada com sucesso' })
  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
