import { Brain, Calendar, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  className?: string
}

const navigationItems = [
  {
    id: 'plan',
    label: 'Plan',
    icon: Brain,
    active: true,
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: Calendar,
    active: false,
    disabled: true,
  },
  {
    id: 'connect',
    label: 'Connect',
    icon: Mail,
    active: false,
    disabled: true,
  },
]

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn('w-16 bg-white border-r border-gray-200 flex flex-col items-center py-6', className)}>
      <div className="mb-8">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-semibold text-sm">P</span>
        </div>
      </div>
      
      <nav className="flex flex-col space-y-4">
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200',
                item.active
                  ? 'bg-indigo-100 text-indigo-600'
                  : item.disabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              )}
              disabled={item.disabled}
              title={item.label}
            >
              <Icon size={20} />
            </button>
          )
        })}
      </nav>
    </div>
  )
}