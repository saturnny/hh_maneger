'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { MainLayout } from '@/components/layout/MainLayout'
import { CardKPI } from '@/components/ui/CardKPI'
import { Plus, Eye, Calendar, Clock, PenTool } from 'lucide-react'
import Link from 'next/link'

interface Lancamento {
  id: number
  data: string
  hora_inicio: string
  hora_fim: string
  descricao?: string
  horas_trabalhadas: number
  atividades: {
    id: number
    nome: string
  }
}

interface Metrics {
  totalEntries: number
  hoursAppropriated: number
  hoursPending: number
}

export default function UserDashboard() {
  const { data: session } = useSession()
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [todayLancamentos, setTodayLancamentos] = useState<Lancamento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Buscar métricas do usuário
      const metricsResponse = await fetch('/api/metrics?type=user-today')
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()
        setMetrics(metricsData)
      }

      // Buscar lançamentos de hoje
      const today = new Date().toISOString().split('T')[0]
      const lancamentosResponse = await fetch(`/api/lancamentos?from=${today}&to=${today}`)
      if (lancamentosResponse.ok) {
        const lancamentosData = await lancamentosResponse.json()
        setTodayLancamentos(lancamentosData.lancamentos || [])
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error)
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

  if (loading) {
    return (
      <MainLayout title="Dashboard" subtitle="Carregando...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout 
      title="Dashboard" 
      subtitle={`Bem-vindo(a) de volta, ${session?.user?.name}!`}
      action={
        <div className="flex items-center space-x-3">
          <Link
            href="/user/meus-lancamentos"
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Ver Todos</span>
          </Link>
          <Link
            href="/user/meus-lancamentos?action=new"
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lançamento</span>
          </Link>
        </div>
      }
    >
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <CardKPI
          title="LANÇAMENTOS HOJE"
          value={metrics?.totalEntries || 0}
          icon={<PenTool className="w-6 h-6" />}
          color="red"
        />
        <CardKPI
          title="HORAS HOJE"
          value={formatDuration(metrics?.hoursAppropriated || 0)}
          icon={<Clock className="w-6 h-6" />}
          color="green"
        />
        <CardKPI
          title="HORAS PENDENTES"
          value={formatDuration(metrics?.hoursPending || 0)}
          icon={<Calendar className="w-6 h-6" />}
          color="blue"
        />
      </div>

      {/* Tabela de Atividades de Hoje */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Atividades de Hoje</h2>
              <p className="text-sm text-gray-600 mt-1">Seus lançamentos do dia de hoje</p>
            </div>
          </div>
        </div>

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
              {todayLancamentos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-3">
                      <Calendar className="w-12 h-12 text-gray-400" />
                      <p className="text-lg font-medium">Nenhum lançamento hoje</p>
                      <p className="text-sm">Comece registrando suas atividades do dia</p>
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
                todayLancamentos.map((lancamento) => (
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
                          Editar
                        </Link>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => {
                            // TODO: Implementar exclusão
                            console.log('Excluir lançamento:', lancamento.id)
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Excluir
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
