import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      tipoUsuario: string
      gestao?: string
      area?: string
      equipe?: string
      especialidade?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    tipoUsuario: string
    gestao?: string
    area?: string
    equipe?: string
    especialidade?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    tipoUsuario: string
    gestao?: string
    area?: string
    equipe?: string
    especialidade?: string
  }
}
