import { useState, useEffect } from 'react'
import { Calendar, Clock, Tag, FileText, Trash2, User, AlertCircle, Plus, Circle, CheckCircle2 } from 'lucide-react'
import { useTaskStore, Task, Person, Subtask } from '@/store/taskStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'

interface TaskEditDialogProps {
  taskId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
  { value: 'blocked', label: 'Blocked' },
]

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

const categoryOptions = [
  { value: 'private', label: 'Private' },
  { value: 'work', label: 'Work' },
]

export function TaskEditDialog({ taskId, open, onOpenChange }: TaskEditDialogProps) {
  const { tasks, updateTask, deleteTask, addSubtask, updateSubtask, deleteSubtask } = useTaskStore()
  const task = tasks.find(t => t.id === taskId)
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [dueDate, setDueDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [status, setStatus] = useState<Task['status']>('todo')
  const [priority, setPriority] = useState<Task['priority']>('medium')
  const [category, setCategory] = useState<Task['category']>('work')
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setNotes(task.notes || '')
      setTags(task.tags || [])
      setDueDate(task.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : '')
      setScheduledTime(task.scheduledTime || '')
      setStatus(task.status || 'todo')
      setPriority(task.priority || 'medium')
      setCategory(task.category || 'work')
      setTagInput('')
      setNewSubtaskTitle('')
    }
  }, [task])

  const handleSave = () => {
    if (!task || !title.trim()) return

    const updates: Partial<Task> = {
      title: title.trim(),
      description: description.trim() || undefined,
      notes: notes.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      scheduledTime: scheduledTime || undefined,
      status,
      priority,
      category,
    }

    updateTask(task.id, updates)
    onOpenChange(false)
  }

  const handleDelete = () => {
    if (!task) return
    deleteTask(task.id)
    onOpenChange(false)
  }

  const handleAddTag = () => {
    const newTag = tagInput.trim()
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleAddSubtask = () => {
    if (!task || !newSubtaskTitle.trim()) return
    addSubtask(task.id, newSubtaskTitle.trim())
    setNewSubtaskTitle('')
  }

  const handleSubtaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSubtask()
    }
  }

  const handleToggleSubtask = (subtaskId: string, completed: boolean) => {
    if (!task) return
    updateSubtask(task.id, subtaskId, { completed })
  }

  const handleDeleteSubtask = (subtaskId: string) => {
    if (!task) return
    deleteSubtask(task.id, subtaskId)
  }

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task name</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="text-base"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              rows={2}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(value: Task['category']) => setCategory(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subtasks */}
          <div className="space-y-2">
            <Label>Subtasks</Label>
            <div className="space-y-2">
              {task.subtasks?.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                  <button
                    onClick={() => handleToggleSubtask(subtask.id, !subtask.completed)}
                    className="flex-shrink-0"
                  >
                    {subtask.completed ? (
                      <CheckCircle2 size={16} className="text-green-600" />
                    ) : (
                      <Circle size={16} className="text-gray-400" />
                    )}
                  </button>
                  <span className={cn(
                    'flex-1 text-sm',
                    subtask.completed ? 'line-through text-gray-500' : 'text-gray-900'
                  )}>
                    {subtask.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSubtask(subtask.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={handleSubtaskKeyDown}
                  placeholder="Add subtask..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSubtask}
                  disabled={!newSubtaskTitle.trim()}
                >
                  <Plus size={14} />
                </Button>
              </div>
            </div>
          </div>

          {/* People (Read-only for now) */}
          {task.people && task.people.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User size={14} />
                People
              </Label>
              <div className="flex items-center gap-2 flex-wrap">
                {task.people.map((person) => (
                  <div key={person.id} className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={person.avatar} alt={person.name} />
                      <AvatarFallback className="text-xs">
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-700">{person.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="flex items-center gap-2">
              <Calendar size={14} />
              Due Date
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <AlertCircle size={14} />
              Status
            </Label>
            <Select value={status} onValueChange={(value: Task['status']) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tag size={14} />
              Tags
            </Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Add tag..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-red-100 hover:text-red-800 bg-blue-50 text-blue-700 border-blue-200"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(value: Task['priority']) => setPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Created by (Read-only) */}
          {task.createdBy && (
            <div className="space-y-2">
              <Label>Created by</Label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={task.createdBy.avatar} alt={task.createdBy.name} />
                  <AvatarFallback className="text-xs">
                    {task.createdBy.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-700">{task.createdBy.name}</span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <FileText size={14} />
              Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes..."
              rows={3}
            />
          </div>

          {/* Scheduled Time */}
          <div className="space-y-2">
            <Label htmlFor="scheduledTime" className="flex items-center gap-2">
              <Clock size={14} />
              Scheduled Time
            </Label>
            <Input
              id="scheduledTime"
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="flex items-center gap-2"
            >
              <Trash2 size={14} />
              Delete
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!title.trim()}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}