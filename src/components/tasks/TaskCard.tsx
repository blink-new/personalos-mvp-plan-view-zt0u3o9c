import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  Calendar, 
  AlertTriangle, 
  Tag, 
  Circle, 
  CheckCircle2, 
  Briefcase, 
  User,
  Plus
} from 'lucide-react'
import { Task, useTaskStore } from '@/store/taskStore'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { useState } from 'react'

interface TaskCardProps {
  task: Task
  onClick?: () => void
  isDragging?: boolean
}

const priorityConfig = {
  low: { label: 'L', color: 'text-gray-500', bgColor: 'bg-gray-100' },
  medium: { label: 'M', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  high: { label: 'H', color: 'text-red-600', bgColor: 'bg-red-100' },
  urgent: { label: 'U', color: 'text-red-700', bgColor: 'bg-red-200' },
}

const categoryConfig = {
  private: { label: 'Private', color: 'text-blue-600', icon: User },
  work: { label: 'Work', color: 'text-green-600', icon: Briefcase },
}

export function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
  const { updateTask, addSubtask } = useTaskStore()
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [deadlineOpen, setDeadlineOpen] = useState(false)
  const [priorityOpen, setPriorityOpen] = useState(false)
  const [tagsOpen, setTagsOpen] = useState(false)
  const [newTag, setNewTag] = useState('')

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
  const completedSubtasks = task.subtasks?.filter(sub => sub.completed).length || 0
  const totalSubtasks = task.subtasks?.length || 0

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation()
    updateTask(task.id, { completed: !task.completed })
  }

  const handleAddSubtask = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSubtaskTitle.trim()) {
      addSubtask(task.id, newSubtaskTitle.trim())
      setNewSubtaskTitle('')
    }
  }

  const handleDeadlineChange = (date: string) => {
    updateTask(task.id, { dueDate: date ? new Date(date) : undefined })
    setDeadlineOpen(false)
  }

  const handlePriorityChange = (priority: Task['priority']) => {
    updateTask(task.id, { priority })
    setPriorityOpen(false)
  }

  const handleAddTag = () => {
    if (newTag.trim() && !task.tags?.includes(newTag.trim())) {
      updateTask(task.id, { 
        tags: [...(task.tags || []), newTag.trim()] 
      })
      setNewTag('')
    }
  }

  const CategoryIcon = task.category ? categoryConfig[task.category].icon : User

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'p-4 cursor-pointer transition-all duration-200 hover:shadow-md group',
        isDragging || isSortableDragging ? 'opacity-50 shadow-lg' : '',
        isOverdue ? 'bg-red-50 border-red-200' : 'bg-white hover:bg-gray-50',
        'rounded-lg border'
      )}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      {/* Header: Category and People */}
      <div className="flex items-start justify-between mb-3">
        {/* Category */}
        <div className="flex items-center gap-1.5">
          <CategoryIcon size={14} className={task.category ? categoryConfig[task.category].color : 'text-gray-400'} />
          <span className={cn(
            'text-sm font-medium',
            task.category ? categoryConfig[task.category].color : 'text-gray-400'
          )}>
            {task.category ? categoryConfig[task.category].label : 'No Category'}
          </span>
        </div>

        {/* People */}
        {task.people && task.people.length > 0 && (
          <div className="flex items-center -space-x-1">
            {task.people.slice(0, 3).map((person) => (
              <Avatar key={person.id} className="w-6 h-6 border-2 border-white">
                <AvatarImage src={person.avatar} alt={person.name} />
                <AvatarFallback className="text-xs">
                  {person.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
            {task.people.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                <span className="text-xs text-gray-600">+{task.people.length - 3}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Middle: Title, Description, and Subtasks */}
      <div className="space-y-2 mb-4">
        {/* Title with completion circle */}
        <div className="flex items-start gap-2">
          <button
            onClick={handleToggleComplete}
            className="flex-shrink-0 mt-0.5 hover:scale-110 transition-transform"
          >
            {task.completed ? (
              <CheckCircle2 size={16} className="text-green-600" />
            ) : (
              <Circle size={16} className="text-gray-400 hover:text-gray-600" />
            )}
          </button>
          <h3 className={cn(
            'font-medium text-base leading-tight flex-1',
            task.completed ? 'line-through text-gray-500' : 'text-gray-900',
            isOverdue && !task.completed ? 'text-red-900' : ''
          )}>
            {task.title}
          </h3>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-gray-600 ml-6 line-clamp-1">
            {task.description}
          </p>
        )}

        {/* Subtasks */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="ml-6 space-y-1">
            {task.subtasks.slice(0, 3).map((subtask) => (
              <div key={subtask.id} className="flex items-center gap-2 text-sm">
                <Circle size={12} className={subtask.completed ? 'text-green-600' : 'text-gray-400'} />
                <span className={cn(
                  subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'
                )}>
                  {subtask.title}
                </span>
              </div>
            ))}
            {task.subtasks.length > 3 && (
              <div className="text-sm text-gray-500 ml-3.5">
                +{task.subtasks.length - 3} more subtasks
              </div>
            )}
            {/* Add subtask input */}
            <div className="flex items-center gap-2 ml-3.5">
              <Plus size={12} className="text-gray-400" />
              <Input
                placeholder="Add subtask..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={handleAddSubtask}
                className="text-sm h-6 border-none p-0 focus-visible:ring-0 placeholder:text-gray-400"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </div>

      <Separator className="mb-4" />

      {/* Bottom: Icons for Deadline, Priority, Tags */}
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          {/* Deadline */}
          <Popover open={deadlineOpen} onOpenChange={setDeadlineOpen}>
            <PopoverTrigger asChild>
              <button 
                className="flex items-center gap-1.5 text-sm hover:bg-gray-100 rounded px-2 py-1 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Calendar size={14} className={task.dueDate ? 'text-blue-600' : 'text-gray-400'} />
                {task.dueDate ? (
                  <span className={cn(
                    'text-sm',
                    isOverdue ? 'text-red-600' : 'text-gray-700'
                  )}>
                    {format(task.dueDate, 'MMM d, yyyy')}
                  </span>
                ) : (
                  <span className="text-gray-400">No date</span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={task.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => handleDeadlineChange(e.target.value)}
                />
                {task.dueDate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeadlineChange('')}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Priority */}
          <Popover open={priorityOpen} onOpenChange={setPriorityOpen}>
            <PopoverTrigger asChild>
              <button 
                className="flex items-center gap-1.5 text-sm hover:bg-gray-100 rounded px-2 py-1 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <AlertTriangle size={14} className={task.priority ? priorityConfig[task.priority].color : 'text-gray-400'} />
                {task.priority ? (
                  <span className={cn(
                    'text-sm font-medium',
                    priorityConfig[task.priority].color
                  )}>
                    {priorityConfig[task.priority].label}
                  </span>
                ) : (
                  <span className="text-gray-400">No priority</span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={task.priority || ''} onValueChange={handlePriorityChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
            <PopoverTrigger asChild>
              <button 
                className="flex items-center gap-1.5 text-sm hover:bg-gray-100 rounded px-2 py-1 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Tag size={14} className={task.tags?.length ? 'text-purple-600' : 'text-gray-400'} />
                <span className="text-gray-400">
                  {task.tags?.length ? `${task.tags.length} tags` : 'No tags'}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-3">
                <label className="text-sm font-medium">Tags</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button size="sm" onClick={handleAddTag}>Add</Button>
                </div>
                {task.tags && task.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {task.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Existing tags display */}
          {task.tags && task.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs bg-purple-50 text-purple-700 border-purple-200"
            >
              {tag}
            </Badge>
          ))}
          {task.tags && task.tags.length > 2 && (
            <span className="text-xs text-gray-500">+{task.tags.length - 2} more</span>
          )}
        </div>
      </div>
    </Card>
  )
}