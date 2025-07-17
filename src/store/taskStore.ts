import { create } from 'zustand'
import { addDays, format, isAfter, isBefore, startOfDay, isToday, isTomorrow } from 'date-fns'

export interface Person {
  id: string
  name: string
  avatar?: string
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface Task {
  id: string
  title: string
  notes?: string
  description?: string
  tags?: string[]
  people?: Person[]
  dueDate?: Date
  scheduledDate?: Date
  scheduledTime?: string
  status?: 'todo' | 'in-progress' | 'done' | 'blocked'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  category?: 'private' | 'work'
  subtasks?: Subtask[]
  completed?: boolean
  createdBy?: Person
  location: 'someday' | 'overdue' | string // string for day keys like '2024-01-15'
  createdAt: Date
  updatedAt: Date
}

interface TaskStore {
  tasks: Task[]
  currentWeekStart: Date
  addTask: (title: string) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  moveTask: (id: string, newLocation: string) => void
  deleteTask: (id: string) => void
  addSubtask: (taskId: string, title: string) => void
  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<Subtask>) => void
  deleteSubtask: (taskId: string, subtaskId: string) => void
  getTasksByLocation: (location: string) => Task[]
  getOverdueTasks: () => Task[]
  setCurrentWeekStart: (date: Date) => void
  getWeekDays: () => { date: Date; key: string; label: string }[]
}

const generateId = () => Math.random().toString(36).substr(2, 9)

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [
    // Sample tasks for demo
    {
      id: '1',
      title: 'Review quarterly goals',
      description: 'Prepare for team meeting and review Q4 objectives',
      notes: 'Prepare for team meeting',
      tags: ['work', 'planning'],
      people: [
        { id: '1', name: 'John Doe', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
        { id: '2', name: 'Jane Smith', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9e0e4b0?w=32&h=32&fit=crop&crop=face' }
      ],
      status: 'todo' as const,
      priority: 'medium' as const,
      category: 'work' as const,
      subtasks: [
        { id: 'sub1', title: 'Gather Q3 metrics', completed: true },
        { id: 'sub2', title: 'Prepare presentation slides', completed: false },
        { id: 'sub3', title: 'Schedule team meeting', completed: false }
      ],
      completed: false,
      createdBy: { id: '3', name: 'Alex Johnson', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face' },
      location: 'someday',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'Develop For Team UX',
      description: 'Using tools for upcoming design review...',
      notes: 'Update color palette and typography',
      tags: ['UI/UX Design', 'Frontend'],
      people: [
        { id: '4', name: 'Sarah Wilson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face' }
      ],
      status: 'in-progress' as const,
      priority: 'medium' as const,
      category: 'work' as const,
      dueDate: new Date('2024-03-10'),
      subtasks: [
        { id: 'sub4', title: 'Research user feedback', completed: false }
      ],
      completed: false,
      createdBy: { id: '4', name: 'Sarah Wilson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face' },
      location: format(new Date(), 'yyyy-MM-dd'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      title: 'Client presentation',
      description: 'Prepare slides for Q4 review and client meeting',
      notes: 'Prepare slides for Q4 review',
      tags: ['client', 'presentation'],
      people: [
        { id: '1', name: 'John Doe', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
        { id: '5', name: 'Mike Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face' }
      ],
      status: 'blocked' as const,
      priority: 'urgent' as const,
      category: 'private' as const,
      dueDate: addDays(new Date(), -2), // Overdue task
      subtasks: [
        { id: 'sub5', title: 'Create slide deck', completed: true },
        { id: 'sub6', title: 'Review with team', completed: false },
        { id: 'sub7', title: 'Practice presentation', completed: false },
        { id: 'sub8', title: 'Prepare Q&A section', completed: false }
      ],
      completed: false,
      createdBy: { id: '1', name: 'John Doe', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
      location: 'overdue',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  currentWeekStart: startOfDay(new Date()),

  addTask: (title: string) => {
    const newTask: Task = {
      id: generateId(),
      title,
      location: 'someday',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    set((state) => ({
      tasks: [newTask, ...state.tasks], // Add to beginning for better UX
    }))
  },

  updateTask: (id: string, updates: Partial<Task>) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      ),
    }))
  },

  moveTask: (id: string, newLocation: string) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { 
              ...task, 
              location: newLocation,
              scheduledDate: newLocation !== 'someday' && newLocation !== 'overdue' 
                ? new Date(newLocation) 
                : undefined,
              updatedAt: new Date() 
            }
          : task
      ),
    }))
  },

  deleteTask: (id: string) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }))
  },

  addSubtask: (taskId: string, title: string) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: [
                ...(task.subtasks || []),
                {
                  id: generateId(),
                  title,
                  completed: false,
                },
              ],
              updatedAt: new Date(),
            }
          : task
      ),
    }))
  },

  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<Subtask>) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks?.map((subtask) =>
                subtask.id === subtaskId
                  ? { ...subtask, ...updates }
                  : subtask
              ),
              updatedAt: new Date(),
            }
          : task
      ),
    }))
  },

  deleteSubtask: (taskId: string, subtaskId: string) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks?.filter((subtask) => subtask.id !== subtaskId),
              updatedAt: new Date(),
            }
          : task
      ),
    }))
  },

  getTasksByLocation: (location: string) => {
    return get().tasks.filter((task) => task.location === location)
  },

  getOverdueTasks: () => {
    const today = startOfDay(new Date())
    return get().tasks.filter((task) => {
      if (!task.dueDate) return false
      return isBefore(startOfDay(task.dueDate), today)
    })
  },

  setCurrentWeekStart: (date: Date) => {
    set({ currentWeekStart: startOfDay(date) })
  },

  getWeekDays: () => {
    const { currentWeekStart } = get()
    const days = []
    
    // Show 14 days instead of 7 for better scrolling experience
    for (let i = 0; i < 14; i++) {
      const date = addDays(currentWeekStart, i)
      let label: string
      
      if (isToday(date)) {
        label = `Today • ${format(date, 'd')}`
      } else if (isTomorrow(date)) {
        label = `Tomorrow • ${format(date, 'd')}`
      } else {
        label = `${format(date, 'EEEE')} • ${format(date, 'd')}`
      }
      
      days.push({
        date,
        key: format(date, 'yyyy-MM-dd'),
        label,
      })
    }
    
    return days
  },
}))