import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Clock } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import { TaskCard } from './TaskCard'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { format, isToday } from 'date-fns'

interface CalendarSidebarProps {
  onTaskClick: (taskId: string) => void
}

// Generate time slots from 8am to 8pm in 30-minute intervals
const generateTimeSlots = () => {
  const slots = []
  for (let hour = 8; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      const displayTime = format(new Date(2024, 0, 1, hour, minute), 'h:mm a')
      slots.push({ time, displayTime })
    }
  }
  return slots
}

export function CalendarSidebar({ onTaskClick }: CalendarSidebarProps) {
  const { getTasksByLocation } = useTaskStore()
  const timeSlots = generateTimeSlots()
  
  // Get today's tasks
  const todayKey = format(new Date(), 'yyyy-MM-dd')
  const todayTasks = getTasksByLocation(todayKey)

  const TimeSlot = ({ slot }: { slot: { time: string; displayTime: string } }) => {
    const slotId = `time-${slot.time}`
    const { setNodeRef, isOver } = useDroppable({
      id: slotId,
    })

    // Find tasks scheduled for this time slot
    const slotTasks = todayTasks.filter(task => task.scheduledTime === slot.time)

    return (
      <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-b-0">
        <div className="w-16 text-xs text-gray-500 font-medium pt-1 flex-shrink-0">
          {slot.displayTime}
        </div>
        
        <div
          ref={setNodeRef}
          className={cn(
            'flex-1 min-h-12 rounded-lg transition-colors',
            isOver ? 'bg-indigo-50 border-2 border-dashed border-indigo-300' : '',
            slotTasks.length > 0 ? 'bg-gray-50' : ''
          )}
        >
          <SortableContext items={slotTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1 p-1">
              {slotTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick(task.id)}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Clock size={16} className="text-gray-600" />
          <h2 className="font-semibold text-gray-900">Today</h2>
        </div>
        <p className="text-sm text-gray-600">
          {format(new Date(), 'EEEE, MMMM d')}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {timeSlots.map((slot) => (
            <TimeSlot key={slot.time} slot={slot} />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}