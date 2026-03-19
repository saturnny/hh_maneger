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
    if (!atividade) return

    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/atividades/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: atividade.nome,
          descricao: atividade.descricao,
          categoria_id: atividade.categoria_id,
          ativo: atividade.ativo
        })
      })

      if (response.ok) {
        router.push('/admin/atividades')
      } else {
        const data = await response.json()
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
      <MainLayout title="Editar Atividade" subtitle="Carregando...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </MainLayout>
    )
  }

  if (error || !atividade) {
    return (
      <MainLayout title="Editar Atividade" subtitle="Erro">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Atividade não encontrada'}</p>
          <Link href="/admin/atividades" className="text-red-600 hover:text-red-800 mt-2 inline-block">
            ← Voltar para atividades
          </Link>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout 
      title="Editar Atividade" 
      subtitle="Edite as informações da atividade"
      action={
        <Link
          href="/admin/atividades"
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </Link>
      }
    >
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Atividade
              </label>
              <input
                type="text"
                value={atividade.nome}
                onChange={(e) => setAtividade({...atividade, nome: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={atividade.categoria_id}
                onChange={(e) => setAtividade({...atividade, categoria_id: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              >
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição (opcional)
              </label>
              <textarea
                value={atividade.descricao || ''}
                onChange={(e) => setAtividade({...atividade, descricao: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Descreva a atividade..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="ativo"
                checked={atividade.ativo}
                onChange={(e) => setAtividade({...atividade, ativo: e.target.checked})}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
                Atividade ativa
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-4">
              <Link
                href="/admin/atividades"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  )
}
