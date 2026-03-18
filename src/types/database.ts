export interface Usuario {
  id: number
  nome: string
  email: string
  senha: string
  tipo_usuario: 'Administrador' | 'Usuário'
  ativo: boolean
  gestao?: string
  area?: string
  equipe?: string
  especialidade?: string
  created_at: string
  updated_at: string
}

export interface Categoria {
  id: number
  nome: string
  descricao?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface Atividade {
  id: number
  nome: string
  descricao?: string
  categoria_id: number
  ativo: boolean
  created_at: string
  updated_at: string
  categorias?: Categoria
}

export interface Lancamento {
  id: number
  usuario_id: number
  atividade_id: number
  data: string
  hora_inicio: string
  hora_fim: string
  horas_trabalhadas: number
  horas_pendentes: number
  descricao?: string
  created_at: string
  updated_at: string
  usuarios?: Usuario
  atividades?: Atividade
}

export interface CreateUsuarioInput {
  nome: string
  email: string
  senha: string
  tipo_usuario: 'Administrador' | 'Usuário'
  gestao?: string
  area?: string
  equipe?: string
  especialidade?: string
}

export interface UpdateUsuarioInput {
  nome?: string
  email?: string
  senha?: string
  tipo_usuario?: 'Administrador' | 'Usuário'
  ativo?: boolean
  gestao?: string
  area?: string
  equipe?: string
  especialidade?: string
}

export interface CreateCategoriaInput {
  nome: string
  descricao?: string
}

export interface UpdateCategoriaInput {
  nome?: string
  descricao?: string
  ativo?: boolean
}

export interface CreateAtividadeInput {
  nome: string
  descricao?: string
  categoria_id: number
}

export interface UpdateAtividadeInput {
  nome?: string
  descricao?: string
  categoria_id?: number
  ativo?: boolean
}

export interface CreateLancamentoInput {
  usuario_id: number
  atividade_id: number
  data: string
  hora_inicio: string
  hora_fim: string
  descricao?: string
}

export interface UpdateLancamentoInput {
  atividade_id?: number
  data?: string
  hora_inicio?: string
  hora_fim?: string
  descricao?: string
}

export interface MetricsUserToday {
  totalEntries: number
  hoursAppropriated: number
  hoursPending: number
}

export interface MetricsAdmin {
  totalEntries: number
  totalHours: number
  activeUsers: number
}
