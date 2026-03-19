import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se existem atividades vinculadas
    const { data: atividades, error: checkError } = await supabaseServer
      .from('atividades')
      .select('id')
      .eq('categoria_id', params.id)

    if (checkError) {
      console.error('Erro ao verificar atividades vinculadas:', checkError)
      return NextResponse.json({ error: 'Erro ao verificar atividades vinculadas' }, { status: 500 })
    }

    if (atividades && atividades.length > 0) {
      return NextResponse.json({ 
        error: 'Não é possível excluir categoria pois existem atividades vinculadas' 
      }, { status: 400 })
    }

    const { error } = await supabaseServer
      .from('categorias')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Erro ao excluir categoria:', error)
      return NextResponse.json({ error: 'Erro ao excluir categoria' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Categoria excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir categoria:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
