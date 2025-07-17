import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Calendar, User, Plus } from 'lucide-react'
import { Task } from '@/store/taskStore'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface TaskCardProps {
  task: Task
  onClick?: () => void
  isDragging?: boolean
}

const statusConfig = {
  todo: { label: 'To Do', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  'in-progress': { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  done: { label: 'Done', color: 'bg-green-100 text-green-800 border-green-200' },
  blocked: { label: 'Blocked', color: 'bg-red-100 text-red-800 border-red-200' },
}

const priorityConfig = {
  low: { label: 'Low', color: 'text-gray-600' },
  medium: { label: 'Medium', color: 'text-orange-600' },
  high: { label: 'High', color: 'text-red-600' },
  urgent: { label: 'Urgent', color: 'text-red-700 font-semibold' },
}

export function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isOverdue = task.location === 'overdue'

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'p-4 cursor-pointer transition-all duration-200 hover:shadow-md group border-l-4',
        isDragging || isSortableDragging ? 'opacity-50 shadow-lg' : '',
        isOverdue ? 'bg-red-50 border-red-200 border-l-red-400' : 'bg-white hover:bg-gray-50 border-l-transparent hover:border-l-indigo-400',
        'rounded-lg'
      )}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      {/* Header with drag handle and title */}
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical size={16} className="text-gray-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            'font-medium text-base leading-tight',
            isOverdue ? 'text-red-900' : 'text-gray-900'
          )}>
            {task.title}
          </h3>
        </div>
      </div>

      {/* Task properties in rows */}
      <div className="space-y-3 ml-7">
        {/* People */}
        {task.people && task.people.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 w-16 flex-shrink-0">People</span>
            <div className="flex items-center gap-2">
              {task.people.map((person) => (
                <div key={person.id} className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={person.avatar} alt={person.name} />
                    <AvatarFallback className="text-xs">
                      {person.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-700">{person.name}</span>
                </div>
              ))}
              <button className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <Plus size={12} className="text-gray-500" />
              </button>
            </div>
          </div>
        )}

        {/* Due date */}
        {task.dueDate && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 w-16 flex-shrink-0">Due date</span>
            <div className={cn(
              'flex items-center gap-2 text-sm',
              isOverdue ? 'text-red-600' : 'text-gray-700'
            )}>
              <Calendar size={14} />
              <span>{format(task.dueDate, 'd MMMM yyyy')}</span>
            </div>
          </div>
        )}

        {/* Status */}
        {task.status && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 w-16 flex-shrink-0">Status</span>
            <Badge 
              variant="outline" 
              className={cn(
                'text-sm px-3 py-1 font-medium border',
                statusConfig[task.status].color
              )}
            >
              {statusConfig[task.status].label}
            </Badge>
          </div>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 w-16 flex-shrink-0">Tags</span>
            <div className="flex items-center gap-2 flex-wrap">
              {task.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className={cn(
                    'text-sm px-3 py-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 cursor-pointer',
                    isOverdue ? 'bg-red-100 text-red-800 border-red-200' : ''
                  )}
                >
                  {tag}
                </Badge>
              ))}
              <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                <Plus size={12} />
                Add more
              </button>
            </div>
          </div>
        )}

        {/* Priority */}
        {task.priority && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 w-16 flex-shrink-0">Priority</span>
            <span className={cn(
              'text-sm font-medium',
              priorityConfig[task.priority].color
            )}>
              {priorityConfig[task.priority].label}
            </span>
          </div>
        )}

        {/* Created by */}
        {task.createdBy && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 w-16 flex-shrink-0">Created by</span>
            <div className="flex items-center gap-2">
              <Avatar className="w-5 h-5">
                <AvatarImage src={task.createdBy.avatar} alt={task.createdBy.name} />
                <AvatarFallback className="text-xs">
                  {task.createdBy.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-700">{task.createdBy.name}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}