'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { Save, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Atividade {
  id: number
  nome: string
  descricao?: string
  categoria_id: number
  ativo: boolean
  categorias: {
    id: number
    nome: string
  }
}

interface Categoria {
  id: number
  nome: string
}

export default function EditarAtividade({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [atividade, setAtividade] = useState<Atividade | null>(null)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAtividade()
    fetchCategorias()
  }, [])

  const fetchAtividade = async () => {
    try {
      const response = await fetch(`/api/admin/atividades/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setAtividade(data.atividade)
      } else {
        setError('Atividade não encontrada')
      }
    } catch (error) {
      console.error('Erro ao buscar atividade:', error)
      setError('Erro ao buscar atividade')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/admin/categorias')
      if (response.ok) {
        const data = await response.json()
        setCategorias(data.categorias || [])
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    if (!atividade) return

    try {
      const response = await fetch(`/api/admin/atividades/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: atividade.nome,
          descricao: atividade.descricao,
          categoria_id: atividade.categoria_id
        })
      })

      if (response.ok) {
        console.log('Atividade atualizada com sucesso!')
        router.push('/admin/atividades')
      } else {
        const data = await response.json()
        console.error('Erro ao atualizar atividade:', data)
        setError(data.error || 'Erro ao atualizar atividade')
      }
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error)
      setError('Erro ao atualizar atividade')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <MainLayout title="Carregando..." subtitle="Buscando atividade">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </MainLayout>
    )
  }

  if (!atividade) {
    return (
      <MainLayout title="Atividade não encontrada" subtitle="A atividade solicitada não foi encontrada">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Atividade não encontrada</h2>
            <p className="text-gray-600 mb-6">A atividade que você está tentando editar não foi encontrada.</p>
            <Link
              href="/admin/atividades"
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Atividades
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout title="Editar Atividade" subtitle="Altere as informações da atividade">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Atividade
              </label>
              <input
                type="text"
                value={atividade.nome}
                onChange={(e) => setAtividade({...atividade, nome: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={atividade.descricao || ''}
                onChange={(e) => setAtividade({...atividade, descricao: e.target.value})}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={atividade.categoria_id}
                onChange={(e) => setAtividade({...atividade, categoria_id: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end space-x-4">
              <Link
                href="/admin/atividades"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </Link>
              
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  )
}
