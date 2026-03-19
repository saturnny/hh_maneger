'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { Save, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Categoria {
  id: number
  nome: string
  descricao?: string
  ativo: boolean
  atividades_count?: number
}

export default function EditarCategoria({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [categoria, setCategoria] = useState<Categoria | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCategoria()
  }, [])

  const fetchCategoria = async () => {
    try {
      const response = await fetch(`/api/admin/categorias/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setCategoria(data.categoria)
      } else {
        setError('Categoria não encontrada')
      }
    } catch (error) {
      console.error('Erro ao buscar categoria:', error)
      setError('Erro ao buscar categoria')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoria) return

    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/categorias/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: categoria.nome,
          descricao: categoria.descricao,
          ativo: categoria.ativo
        })
      })

      if (response.ok) {
        router.push('/admin/categorias')
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao atualizar categoria')
      }
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error)
      setError('Erro ao atualizar categoria')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <MainLayout title="Editar Categoria" subtitle="Carregando...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </MainLayout>
    )
  }

  if (error || !categoria) {
    return (
      <MainLayout title="Editar Categoria" subtitle="Erro">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Categoria não encontrada'}</p>
          <Link href="/admin/categorias" className="text-red-600 hover:text-red-800 mt-2 inline-block">
            ← Voltar para categorias
          </Link>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout 
      title="Editar Categoria" 
      subtitle="Edite as informações da categoria"
      action={
        <Link
          href="/admin/categorias"
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
                Nome da Categoria
              </label>
              <input
                type="text"
                value={categoria.nome}
                onChange={(e) => setCategoria({...categoria, nome: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição (opcional)
              </label>
              <textarea
                value={categoria.descricao || ''}
                onChange={(e) => setCategoria({...categoria, descricao: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Descreva a categoria..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="ativo"
                checked={categoria.ativo}
                onChange={(e) => setCategoria({...categoria, ativo: e.target.checked})}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
                Categoria ativa
              </label>
            </div>

            {categoria.atividades_count && categoria.atividades_count > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  Esta categoria possui {categoria.atividades_count} atividade(s) vinculada(s)
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-4">
              <Link
                href="/admin/categorias"
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
