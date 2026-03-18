'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardKPIProps {
  title: string
  value: string | number
  icon?: ReactNode
  color?: 'red' | 'green' | 'blue' | 'gray'
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function CardKPI({ 
  title, 
  value, 
  icon, 
  color = 'gray',
  trend 
}: CardKPIProps) {
  const colorClasses = {
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      value: 'text-red-700'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      value: 'text-green-700'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      value: 'text-blue-700'
    },
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      icon: 'text-gray-600',
      value: 'text-gray-700'
    }
  }

  const classes = colorClasses[color]

  return (
    <div className={cn(
      'bg-white rounded-xl border border-gray-200 p-6 shadow-sm',
      'hover:shadow-md transition-shadow duration-200'
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          'w-12 h-12 rounded-lg flex items-center justify-center',
          classes.bg
        )}>
          {icon}
        </div>
        {trend && (
          <div className={cn(
            'flex items-center space-x-1 text-sm font-medium',
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          )}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className={cn(
          'text-2xl font-bold',
          classes.value
        )}>
          {value}
        </p>
      </div>
    </div>
  )
}
