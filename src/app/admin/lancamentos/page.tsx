'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Calendar, Clock, Users, Filter, Edit2, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'

interface Lancamento {
  id: number
  data: string
  hora_inicio: string
  hora_fim: string
  descricao?: string
  horas_trabalhadas: number
  usuarios: {
    id: number
    nome: string
    email: string
  }
  atividades: {
    id: number
    nome: string
    categorias: {
      nome: string
    }
  }
}

export default function AdminLancamentos() {
  const { data: session } = useSession()
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
    usuario: '',
    atividade: ''
  })

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [lancamentosResponse, usuariosResponse] = await Promise.all([
        fetch(`/api/admin/lancamentos?${new URLSearchParams({
          from: filters.from,
          to: filters.to,
          usuario: filters.usuario,
          atividade: filters.atividade
        })}`),
        fetch('/api/admin/usuarios')
      ])
      
      if (lancamentosResponse.ok) {
        const data = await lancamentosResponse.json()
        console.log('Lançamentos recebidos:', data)
        setLancamentos(data.lancamentos || [])
      }
      
      if (usuariosResponse.ok) {
        const usuariosData = await usuariosResponse.json()
        console.log('Usuários recebidos:', usuariosData)
        setUsuarios(usuariosData.usuarios || [])
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este lançamento?')) return
    
    try {
      const response = await fetch(`/api/admin/lancamentos/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchData()
      } else {
        alert('Erro ao excluir lançamento')
      }
    } catch (error) {
      console.error('Erro ao excluir lançamento:', error)
      alert('Erro ao excluir lançamento')
    }
  }

  const formatDuration = (hours: number): string => {
    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)
    
    if (wholeHours === 0 && minutes === 0) return '0h'
    if (wholeHours === 0) return `${minutes}m`
    if (minutes === 0) return `${wholeHours}h`
    
    return `${wholeHours}h ${minutes}m`
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (timeString: string): string => {
    return timeString.substring(0, 5)
  }

  if (loading) {
    return (
      <MainLayout title="Lançamentos da Equipe" subtitle="Carregando...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout 
      title="Lançamentos da Equipe" 
      subtitle="Visualize e gerencie todos os lançamentos de tempo"
    >
      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Início</label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters({...filters, from: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Fim</label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters({...filters, to: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Usuário</label>
            <select
              value={filters.usuario}
              onChange={(e) => setFilters({...filters, usuario: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Todos</option>
              {usuarios.map((usuario: any) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              {lancamentos.length} lançamento(s) encontrado(s)
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Lançamentos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Início
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fim
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Atividade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duração
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Observação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lancamentos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-3">
                      <Calendar className="w-12 h-12 text-gray-400" />
                      <p className="text-lg font-medium">Nenhum lançamento encontrado</p>
                      <p className="text-sm">Tente ajustar os filtros ou verifique outra data</p>
                    </div>
                  </td>
                </tr>
              ) : (
                lancamentos.map((lancamento) => (
                  <tr key={lancamento.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(lancamento.data)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{lancamento.usuarios.nome}</div>
                          <div className="text-xs text-gray-500">{lancamento.usuarios.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(lancamento.hora_inicio)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(lancamento.hora_fim)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {lancamento.atividades.nome}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {lancamento.atividades.categorias?.nome}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDuration(lancamento.horas_trabalhadas)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={lancamento.descricao}>
                        {lancamento.descricao || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/lancamentos/${lancamento.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleDelete(lancamento.id)}
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
