'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { Plus, Edit2, Trash2, FolderOpen, Tag } from 'lucide-react'
import Link from 'next/link'

interface Categoria {
  id: number
  nome: string
  descricao?: string
  ativo: boolean
  atividades_count?: number
}

export default function AdminCategorias() {
  const { data: session } = useSession()
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Verificar se action=new na URL
  const router = useRouter()
  const searchParams = useSearchParams()
  const action = searchParams.get('action')
  const editId = searchParams.get('id')

  useEffect(() => {
    fetchCategorias()
  }, [])

  // Redirecionar para página de nova categoria se action=new
  useEffect(() => {
    if (action === 'new') {
      router.push('/admin/categorias/new')
    }
  }, [action, router])

  // Redirecionar para página de edição se action=edit
  useEffect(() => {
    if (action === 'edit' && editId) {
      router.push(`/admin/categorias/${editId}`)
    }
  }, [action, editId, router])

  const fetchCategorias = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/categorias')
      if (response.ok) {
        const data = await response.json()
        console.log('Categorias recebidas:', data)
        setCategorias(data.categorias || [])
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    const categoria = categorias.find(c => c.id === id)
    if (!categoria) return
    
    if (categoria.atividades_count > 0) {
      alert(`Esta categoria possui ${categoria.atividades_count} atividade(s) vinculada(s). Não é possível excluir.`)
      return
    }
    
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return
    
    try {
      const response = await fetch(`/api/admin/categorias/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchCategorias()
      } else {
        alert('Erro ao excluir categoria')
      }
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
      alert('Erro ao excluir categoria')
    }
  }

  const filteredCategorias = categorias.filter(categoria =>
    categoria.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (categoria.descricao && categoria.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <MainLayout title="Categorias" subtitle="Carregando...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout 
      title="Categorias" 
      subtitle="Gerencie todas as categorias de atividades"
      action={
        <Link
          href="/admin/categorias?action=new"
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </Link>
      }
    >
      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nome ou descrição..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              {filteredCategorias.length} categoria(s) encontrada(s)
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategorias.length === 0 ? (
          <div className="col-span-full">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
              <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Nenhuma categoria encontrada</p>
              <p className="text-sm text-gray-600 mb-4">Tente ajustar os filtros ou crie uma nova categoria</p>
              <Link
                href="/admin/categorias?action=new"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Categoria</span>
              </Link>
            </div>
          </div>
        ) : (
          filteredCategorias.map((categoria) => (
            <div key={categoria.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mr-3"
                    style={{ backgroundColor: '#f3f4f6' }}
                  >
                    <Tag className="w-6 h-6" style={{ color: '#6b7280' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{categoria.nome}</h3>
                    <p className="text-sm text-gray-600">
                      {categoria.atividades_count || 0} atividade(s)
                    </p>
                  </div>
                </div>
              </div>
              
              {categoria.descricao && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {categoria.descricao}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    categoria.atividades_count > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {categoria.atividades_count > 0 ? 'Em uso' : 'Sem uso'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/admin/categorias?action=edit&id=${categoria.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  {categoria.atividades_count === 0 && (
                    <>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => handleDelete(categoria.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </MainLayout>
  )
}
