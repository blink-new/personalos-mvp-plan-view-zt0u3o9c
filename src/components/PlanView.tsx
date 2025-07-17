import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useTaskStore, Task } from '@/store/taskStore'
import { Sidebar } from './layout/Sidebar'
import { SomedayPanel } from './tasks/SomedayPanel'
import { WeeklyTimeline } from './tasks/WeeklyTimeline'
import { CalendarSidebar } from './tasks/CalendarSidebar'
import { TaskEditDialog } from './tasks/TaskEditDialog'
import { TaskCard } from './tasks/TaskCard'

export function PlanView() {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  
  const { tasks, moveTask } = useTaskStore()
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const newLocation = over.id as string

    // Handle time slot drops
    if (newLocation.startsWith('time-')) {
      const time = newLocation.replace('time-', '')
      const todayKey = new Date().toISOString().split('T')[0]
      
      // Move to today and set scheduled time
      moveTask(taskId, todayKey)
      
      // Update the task with scheduled time
      const task = tasks.find(t => t.id === taskId)
      if (task) {
        useTaskStore.getState().updateTask(taskId, { scheduledTime: time })
      }
      return
    }

    // Handle regular location moves
    moveTask(taskId, newLocation)
  }

  const handleTaskClick = (taskId: string) => {
    setEditingTaskId(taskId)
  }

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Navigation Sidebar - Fixed width, scrollable if needed */}
        <div className="flex-shrink-0">
          <Sidebar />
        </div>
        
        {/* Main content area - Three columns with independent scrolling */}
        <div className="flex-1 flex min-w-0 overflow-hidden">
          {/* Someday Panel - Fixed width, vertical scroll */}
          <div className="flex-shrink-0">
            <SomedayPanel onTaskClick={handleTaskClick} />
          </div>
          
          {/* Weekly Timeline - Flexible width, horizontal scroll */}
          <div className="flex-1 min-w-0">
            <WeeklyTimeline onTaskClick={handleTaskClick} />
          </div>
          
          {/* Calendar Sidebar - Fixed width, vertical scroll */}
          <div className="flex-shrink-0">
            <CalendarSidebar onTaskClick={handleTaskClick} />
          </div>
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskEditDialog
        taskId={editingTaskId}
        open={!!editingTaskId}
        onOpenChange={(open) => !open && setEditingTaskId(null)}
      />
    </div>
  )
}