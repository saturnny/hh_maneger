import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { supabaseServer } from './supabase/server'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Credenciais não fornecidas')
          return null
        }

        try {
          console.log('Buscando usuário:', credentials.email)
          const { data: user, error } = await supabaseServer
            .from('usuarios')
            .select('*')
            .eq('email', credentials.email)
            .eq('ativo', true)
          .single()

          console.log('Resultado busca:', { user, error })

          if (error || !user) {
            console.log('Usuário não encontrado ou erro:', error)
            return null
          }

          console.log('Comparando senha...')
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.senha
          )

          console.log('Senha válida:', isPasswordValid)

          if (!isPasswordValid) {
            console.log('Senha inválida')
            return null
          }

          console.log('Login bem sucedido - Dados do usuário:', {
            email: user.email,
            nome: user.nome,
            tipo_usuario: user.tipo_usuario,
            role: user.tipo_usuario === 'Administrador' ? 'ADMIN' : 'USER'
          })

          const userData = {
            id: user.id.toString(),
            email: user.email,
            name: user.nome,
            role: (user.tipo_usuario === 'Admin' || user.tipo_usuario === 'Administrador') ? 'ADMIN' : 'USER',
            tipoUsuario: user.tipo_usuario,
            gestao: user.gestao,
            area: user.area,
            equipe: user.equipe,
            especialidade: user.especialidade,
          }

          console.log('Dados retornados para NextAuth:', userData)
          return userData
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.tipoUsuario = user.tipoUsuario
        token.gestao = user.gestao
        token.area = user.area
        token.equipe = user.equipe
        token.especialidade = user.especialidade
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.tipoUsuario = token.tipoUsuario as string
        session.user.gestao = token.gestao as string
        session.user.area = token.area as string
        session.user.equipe = token.equipe as string
        session.user.especialidade = token.especialidade as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  }
}
