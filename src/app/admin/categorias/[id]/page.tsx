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
    setError('')
    setSaving(true)

    if (!categoria) return

    try {
      const response = await fetch(`/api/admin/categorias/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: categoria.nome,
          descricao: categoria.descricao
        })
      })

      if (response.ok) {
        console.log('Categoria atualizada com sucesso!')
        router.push('/admin/categorias')
      } else {
        const data = await response.json()
        console.error('Erro ao atualizar categoria:', data)
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
      <MainLayout title="Carregando..." subtitle="Buscando categoria">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </MainLayout>
    )
  }

  if (!categoria) {
    return (
      <MainLayout title="Categoria não encontrada" subtitle="A categoria solicitada não foi encontrada">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Categoria não encontrada</h2>
            <p className="text-gray-600 mb-6">A categoria que você está tentando editar não foi encontrada.</p>
            <Link
              href="/admin/categorias"
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Categorias
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout title="Editar Categoria" subtitle="Altere as informações da categoria">
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
                Nome da Categoria
              </label>
              <input
                type="text"
                value={categoria.nome}
                onChange={(e) => setCategoria({...categoria, nome: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={categoria.descricao || ''}
                onChange={(e) => setCategoria({...categoria, descricao: e.target.value})}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-end space-x-4">
              <Link
                href="/admin/categorias"
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
