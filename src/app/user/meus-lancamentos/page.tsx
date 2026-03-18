'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Plus, Eye, Edit2, Trash2, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

interface Lancamento {
  id: number
  data: string
  hora_inicio: string
  hora_fim: string
  descricao?: string
  horas_trabalhadas: number
  horas_pendentes: number
  atividades: {
    id: number
    nome: string
  }
}

export default function MeusLancamentos() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const action = searchParams.get('action')
  
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [loading, setLoading] = useState(true)
  const [editingLancamento, setEditingLancamento] = useState<Lancamento | null>(null)

  useEffect(() => {
    if (action === 'new' || action === 'edit') {
      // Se está em modo de criação/edição, não carrega a lista
      setLoading(false)
    } else {
      fetchLancamentos()
    }
  }, [action])

  const fetchLancamentos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/lancamentos')
      if (response.ok) {
        const data = await response.json()
        setLancamentos(data.lancamentos || [])
      }
    } catch (error) {
      console.error('Erro ao buscar lançamentos:', error)
    } finally {
      setLoading(false)
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

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este lançamento?')) return
    
    try {
      const response = await fetch(`/api/lancamentos/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchLancamentos()
      } else {
        alert('Erro ao excluir lançamento')
      }
    } catch (error) {
      console.error('Erro ao excluir lançamento:', error)
      alert('Erro ao excluir lançamento')
    }
  }

  // Se está em modo de criação/edição, mostra o formulário
  if (action === 'new' || action === 'edit') {
    return <NovoLancamento />
  }

  if (loading) {
    return (
      <MainLayout title="Meus Lançamentos" subtitle="Carregando...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout 
      title="Meus Lançamentos" 
      subtitle="Todos os seus lançamentos de tempo"
      action={
        <Link
          href="/user/meus-lancamentos?action=new"
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Lançamento</span>
        </Link>
      }
    >
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
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
                  Observação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duração
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lancamentos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-3">
                      <Calendar className="w-12 h-12 text-gray-400" />
                      <p className="text-lg font-medium">Nenhum lançamento encontrado</p>
                      <p className="text-sm">Comece registrando suas atividades</p>
                      <Link
                        href="/user/meus-lancamentos?action=new"
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Novo Lançamento</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                lancamentos.map((lancamento) => (
                  <tr key={lancamento.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(lancamento.data)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(lancamento.hora_inicio)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(lancamento.hora_fim)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {lancamento.atividades.nome}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {lancamento.descricao || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {formatDuration(lancamento.horas_trabalhadas)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/user/meus-lancamentos?action=edit&id=${lancamento.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit2 className="w-4 h-4" />
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

// Componente para novo lançamento
function NovoLancamento() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const action = searchParams.get('action')
  const id = searchParams.get('id')

  const [atividades, setAtividades] = useState([])
  const [formData, setFormData] = useState({
    atividade_id: '',
    data: new Date().toISOString().split('T')[0],
    hora_inicio: '',
    hora_fim: '',
    descricao: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAtividades()
    if (action === 'edit' && id) {
      fetchLancamento()
    }
  }, [action, id])

  const fetchAtividades = async () => {
    try {
      const response = await fetch('/api/atividades')
      if (response.ok) {
        const data = await response.json()
        setAtividades(data.atividades || [])
      }
    } catch (error) {
      console.error('Erro ao buscar atividades:', error)
    }
  }

  const fetchLancamento = async () => {
    try {
      const response = await fetch(`/api/lancamentos/${id}`)
      if (response.ok) {
        const data = await response.json()
        setFormData({
          atividade_id: data.atividade_id.toString(),
          data: data.data,
          hora_inicio: data.hora_inicio,
          hora_fim: data.hora_fim,
          descricao: data.descricao || ''
        })
      }
    } catch (error) {
      console.error('Erro ao buscar lançamento:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = action === 'edit' ? `/api/lancamentos/${id}` : '/api/lancamentos'
      const method = action === 'edit' ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/user/meus-lancamentos')
      } else {
        alert('Erro ao salvar lançamento')
      }
    } catch (error) {
      console.error('Erro ao salvar lançamento:', error)
      alert('Erro ao salvar lançamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout 
      title={action === 'edit' ? 'Editar Lançamento' : 'Novo Lançamento'} 
      subtitle="Preencha as informações do seu lançamento"
    >
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Atividade
              </label>
              <select
                value={formData.atividade_id}
                onChange={(e) => setFormData({...formData, atividade_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              >
                <option value="">Selecione uma atividade</option>
                {atividades.map((atividade: any) => (
                  <option key={atividade.id} value={atividade.id}>
                    {atividade.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data
              </label>
              <input
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({...formData, data: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora Início
                </label>
                <input
                  type="time"
                  value={formData.hora_inicio}
                  onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora Fim
                </label>
                <input
                  type="time"
                  value={formData.hora_fim}
                  onChange={(e) => setFormData({...formData, hora_fim: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observação (opcional)
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Descreva sua atividade..."
              />
            </div>

            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/user/meus-lancamentos')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Salvando...' : (action === 'edit' ? 'Atualizar' : 'Salvar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  )
}
