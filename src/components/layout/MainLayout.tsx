'use client'

import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

interface MainLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  action?: ReactNode
}

export function MainLayout({ children, title, subtitle, action }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
            {action && (
              <div className="flex items-center space-x-3">
                {action}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
