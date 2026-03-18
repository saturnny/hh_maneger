'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { MainLayout } from '@/components/layout/MainLayout'
import { CardKPI } from '@/components/ui/CardKPI'
import { Users, Clock, PenTool, TrendingUp } from 'lucide-react'

interface Metrics {
  totalEntries: number
  totalHours: number
  activeUsers: number
}

interface Usuario {
  id: number
  nome: string
  email: string
  tipo_usuario: string
  ativo: boolean
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  })
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    fetchDashboardData()
    setInitialized(true)
  }, [])

  useEffect(() => {
    if (initialized && (selectedUser || dateRange.from || dateRange.to)) {
      fetchMetrics()
    }
  }, [selectedUser, dateRange, initialized])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Buscar métricas globais
      const metricsResponse = await fetch('/api/metrics?type=admin')
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()
        setMetrics(metricsData)
      }

      // Buscar usuários para filtros
      const usuariosResponse = await fetch('/api/usuarios?pageSize=100')
      if (usuariosResponse.ok) {
        const usuariosData = await usuariosResponse.json()
        setUsuarios(usuariosData.usuarios || [])
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMetrics = async () => {
    try {
      const params = new URLSearchParams({
        type: 'admin',
        ...(selectedUser && { usuario_id: selectedUser }),
        ...(dateRange.from && { from: dateRange.from }),
        ...(dateRange.to && { to: dateRange.to }),
      })

      const metricsResponse = await fetch(`/api/metrics?${params}`)
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()
        setMetrics(metricsData)
      }
    } catch (error) {
      console.error('Erro ao buscar métricas filtradas:', error)
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
      subtitle="Visão geral do sistema"
    >
      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuário
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Todos os usuários</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nome}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Início
            </label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Fim
            </label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>
        
        <div className="mt-4 flex items-center space-x-3">
          <button
            onClick={() => {
              setSelectedUser('')
              setDateRange({
                from: new Date().toISOString().split('T')[0],
                to: new Date().toISOString().split('T')[0]
              })
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <CardKPI
          title="TOTAL DE LANÇAMENTOS"
          value={metrics?.totalEntries || 0}
          icon={<PenTool className="w-6 h-6" />}
          color="red"
        />
        <CardKPI
          title="HORAS TOTAIS"
          value={formatDuration(metrics?.totalHours || 0)}
          icon={<Clock className="w-6 h-6" />}
          color="green"
        />
        <CardKPI
          title="USUÁRIOS ATIVOS"
          value={metrics?.activeUsers || 0}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
      </div>

      {/* Estatísticas Adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Resumo de Atividade</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Média de horas por usuário</span>
              <span className="font-semibold text-gray-900">
                {metrics?.activeUsers 
                  ? formatDuration(metrics.totalHours / metrics.activeUsers)
                  : '0h'
                }
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Média de lançamentos por usuário</span>
              <span className="font-semibold text-gray-900">
                {metrics?.activeUsers 
                  ? (metrics.totalEntries / metrics.activeUsers).toFixed(1)
                  : '0'
                }
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total de usuários cadastrados</span>
              <span className="font-semibold text-gray-900">
                {usuarios.length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Distribuição de Usuários</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Administradores</span>
              <span className="font-semibold text-gray-900">
                {usuarios.filter(u => u.tipo_usuario === 'Administrador').length}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Usuários Comuns</span>
              <span className="font-semibold text-gray-900">
                {usuarios.filter(u => u.tipo_usuario === 'Usuário').length}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Usuários Ativos</span>
              <span className="font-semibold text-gray-900">
                {usuarios.filter(u => u.ativo).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
