import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import { TaskCard } from './TaskCard'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { addWeeks, subWeeks, format, isToday, addDays } from 'date-fns'

interface WeeklyTimelineProps {
  onTaskClick: (taskId: string) => void
}

export function WeeklyTimeline({ onTaskClick }: WeeklyTimelineProps) {
  const { 
    currentWeekStart, 
    setCurrentWeekStart, 
    getWeekDays, 
    getTasksByLocation,
    getOverdueTasks 
  } = useTaskStore()
  
  const weekDays = getWeekDays()
  const overdueTasks = getOverdueTasks()

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart = direction === 'prev' 
      ? subWeeks(currentWeekStart, 1)
      : addWeeks(currentWeekStart, 1)
    setCurrentWeekStart(newWeekStart)
  }

  const OverdueSection = () => {
    const { setNodeRef, isOver } = useDroppable({
      id: 'overdue',
    })

    if (overdueTasks.length === 0) return null

    return (
      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle size={16} className="text-red-600" />
          <h3 className="font-medium text-red-900 text-sm">Overdue ({overdueTasks.length})</h3>
        </div>
        
        <div
          ref={setNodeRef}
          className={cn(
            'transition-colors rounded-lg p-2',
            isOver ? 'bg-red-100' : ''
          )}
        >
          <SortableContext items={overdueTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div className="flex gap-2 flex-wrap">
              {overdueTasks.map((task) => (
                <div key={task.id} className="w-64">
                  <TaskCard
                    task={task}
                    onClick={() => onTaskClick(task.id)}
                  />
                </div>
              ))}
            </div>
          </SortableContext>
        </div>
      </div>
    )
  }

  const DayColumn = ({ day }: { day: { date: Date; key: string; label: string } }) => {
    const dayTasks = getTasksByLocation(day.key)
    const { setNodeRef, isOver } = useDroppable({
      id: day.key,
    })

    return (
      <div className="flex-shrink-0 w-72">
        <div className="mb-3 text-center">
          <h3 className={cn(
            'font-medium text-sm',
            isToday(day.date) ? 'text-indigo-600' : 'text-gray-900'
          )}>
            {day.label}
          </h3>
          {isToday(day.date) && (
            <div className="w-2 h-2 bg-indigo-600 rounded-full mx-auto mt-1" />
          )}
        </div>
        
        <div
          ref={setNodeRef}
          className={cn(
            'min-h-96 p-3 rounded-xl border-2 border-dashed transition-colors',
            isOver 
              ? 'border-indigo-300 bg-indigo-50' 
              : 'border-gray-200 bg-gray-50/50'
          )}
        >
          <SortableContext items={dayTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {dayTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick(task.id)}
                />
              ))}
              
              {dayTasks.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No tasks</p>
                </div>
              )}
            </div>
          </SortableContext>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold text-gray-900">
            {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 13), 'MMM d, yyyy')}
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek('prev')}
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek('next')}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Content - Vertical scroll container */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <OverdueSection />
          
          {/* Horizontal scrolling timeline */}
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-4" style={{ minWidth: `${weekDays.length * 288}px` }}>
              {weekDays.map((day) => (
                <DayColumn key={day.key} day={day} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}