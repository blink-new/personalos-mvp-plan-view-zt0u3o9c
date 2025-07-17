import { useState, useRef, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, Command } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import { TaskCard } from './TaskCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface SomedayPanelProps {
  onTaskClick: (taskId: string) => void
}

export function SomedayPanel({ onTaskClick }: SomedayPanelProps) {
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { tasks, addTask, getTasksByLocation } = useTaskStore()
  const somedayTasks = getTasksByLocation('someday')
  
  const { setNodeRef, isOver } = useDroppable({
    id: 'someday',
  })

  // Handle CMD+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsAddingTask(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when adding task
  useEffect(() => {
    if (isAddingTask && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isAddingTask])

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim())
      setNewTaskTitle('')
      // Keep input focused for rapid task entry
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTask()
    } else if (e.key === 'Escape') {
      setIsAddingTask(false)
      setNewTaskTitle('')
    }
  }

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="font-semibold text-gray-900 mb-3">Someday</h2>
        
        {isAddingTask ? (
          <div className="space-y-2">
            <Input
              ref={inputRef}
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What needs to be done?"
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim()}
              >
                Add Task
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAddingTask(false)
                  setNewTaskTitle('')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingTask(true)}
            className="w-full justify-start text-gray-600 hover:text-gray-900"
          >
            <Plus size={16} className="mr-2" />
            Add task
            <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
              <Command size={12} />
              <span>K</span>
            </div>
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div
          ref={setNodeRef}
          className={cn(
            'p-4 min-h-full transition-colors',
            isOver ? 'bg-indigo-50' : ''
          )}
        >
          <SortableContext items={somedayTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {somedayTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick(task.id)}
                />
              ))}
              
              {somedayTasks.length === 0 && !isAddingTask && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No tasks yet</p>
                  <p className="text-xs mt-1">Press ⌘K to add your first task</p>
                </div>
              )}
            </div>
          </SortableContext>
        </div>
      </ScrollArea>
    </div>
  )
}