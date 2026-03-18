'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Plus, Edit2, Trash2, List, Tag, Calendar } from 'lucide-react'
import Link from 'next/link'

interface Atividade {
  id: number
  nome: string
  descricao?: string
  categoria_id: number
  categorias: {
    id: number
    nome: string
  }
}

export default function AdminAtividades() {
  const { data: session } = useSession()
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('todas')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [atividadesResponse, categoriasResponse] = await Promise.all([
        fetch('/api/admin/atividades'),
        fetch('/api/admin/categorias')
      ])
      
      if (atividadesResponse.ok) {
        const atividadesData = await atividadesResponse.json()
        console.log('Atividades recebidas:', atividadesData)
        setAtividades(atividadesData.atividades || [])
      }
      
      if (categoriasResponse.ok) {
        const categoriasData = await categoriasResponse.json()
        console.log('Categorias recebidas:', categoriasData)
        setCategorias(categoriasData.categorias || [])
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta atividade?')) return
    
    try {
      const response = await fetch(`/api/admin/atividades/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchData()
      } else {
        alert('Erro ao excluir atividade')
      }
    } catch (error) {
      console.error('Erro ao excluir atividade:', error)
      alert('Erro ao excluir atividade')
    }
  }

  const filteredAtividades = atividades.filter(atividade => {
    const matchesSearch = atividade.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (atividade.descricao && atividade.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = filterCategory === 'todas' || atividade.categoria_id.toString() === filterCategory
    
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <MainLayout title="Atividades" subtitle="Carregando...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout 
      title="Gerenciar Atividades" 
      subtitle="Gerencie todas as atividades do sistema"
      action={
        <Link
          href="/admin/atividades?action=new"
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Atividade</span>
        </Link>
      }
    >
      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="todas">Todas</option>
              {categorias.map((categoria: any) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              {filteredAtividades.length} atividade(s) encontrada(s)
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Atividades */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Atividade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAtividades.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-3">
                      <List className="w-12 h-12 text-gray-400" />
                      <p className="text-lg font-medium">Nenhuma atividade encontrada</p>
                      <p className="text-sm">Tente ajustar os filtros ou crie uma nova atividade</p>
                      <Link
                        href="/admin/atividades?action=new"
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nova Atividade</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAtividades.map((atividade) => (
                  <tr key={atividade.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <Tag className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{atividade.nome}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {atividade.categorias?.nome || 'Sem categoria'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={atividade.descricao}>
                        {atividade.descricao || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/atividades?action=edit&id=${atividade.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleDelete(atividade.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  )
}
