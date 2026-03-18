'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  PenTool, 
  User, 
  Users, 
  Settings, 
  FolderOpen, 
  List, 
  Calendar,
  LogOut
} from 'lucide-react'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  section?: string
}

const navItems: NavItem[] = [
  {
    section: 'PRINCIPAL',
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    section: 'ADMINISTRAÇÃO',
    title: 'Usuários',
    href: '/admin/usuarios',
    icon: Users,
  },
  {
    section: 'ADMINISTRAÇÃO',
    title: 'Gerenciar Atividades',
    href: '/admin/atividades',
    icon: List,
  },
  {
    section: 'ADMINISTRAÇÃO',
    title: 'Categorias',
    href: '/admin/categorias',
    icon: FolderOpen,
  },
  {
    section: 'ADMINISTRAÇÃO',
    title: 'Lançamentos da Equipe',
    href: '/admin/lancamentos',
    icon: Calendar,
  },
]

export function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const isAdmin = session?.user?.role === 'ADMIN'

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const filteredNavItems = navItems.filter(item => {
    if (item.href.startsWith('/admin')) {
      return isAdmin
    }
    if (item.href.startsWith('/user') || !item.href.startsWith('/admin')) {
      return !isAdmin
    }
    return true
  })

  const getHref = (item: NavItem) => {
    if (isAdmin) {
      return item.href.startsWith('/admin') ? item.href : `/admin${item.href}`
    }
    return item.href.startsWith('/user') ? item.href : `/user${item.href}`
  }

  const sections = Array.from(new Set(filteredNavItems.map(item => item.section)))

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-red-800 to-red-900 text-white z-50">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="text-red-700 font-bold text-lg">Q</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">QualiDados</h1>
            <p className="text-red-200 text-sm">Sistema de Atividades</p>
          </div>
        </div>

        <nav className="space-y-6">
          {sections.map(section => (
            <div key={section}>
              <h3 className="text-xs font-semibold text-red-200 uppercase tracking-wider mb-3">
                {section}
              </h3>
              <ul className="space-y-1">
                {filteredNavItems
                  .filter(item => item.section === section)
                  .map(item => {
                    const href = getHref(item)
                    const isActive = pathname === href || 
                                   (item.href !== '/dashboard' && pathname.startsWith(href))
                    
                    return (
                      <li key={item.title}>
                        <Link
                          href={href}
                          className={cn(
                            'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                            isActive
                              ? 'bg-white/12 text-white'
                              : 'text-red-100 hover:bg-white/8 hover:text-white'
                          )}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </li>
                    )
                  })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* User Card */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-red-700">
        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {getInitials(session?.user?.name || 'U')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session?.user?.name}
              </p>
              <p className="text-xs text-red-200">
                {isAdmin ? 'Administrador' : 'Usuário'}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </div>
  )
}
