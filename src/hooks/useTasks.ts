import { useState, useEffect, useCallback } from 'react'
import type { Task, CreateTaskInput, UpdateTaskInput, MoveTaskInput, TaskStatus } from '@/lib/types'
import {
  initDB,
  getAllTasks,
  createTask as dbCreateTask,
  updateTask as dbUpdateTask,
  deleteTask as dbDeleteTask,
  moveTask as dbMoveTask,
  withRetry,
  withTimeout,
} from '@/lib/db'

interface UseTasksResult {
  tasks: Task[]
  loading: boolean
  error: string | null
  createTask: (input: CreateTaskInput) => Promise<void>
  updateTask: (input: UpdateTaskInput) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  moveTask: (input: MoveTaskInput) => Promise<void>
  getTasksByStatus: (status: TaskStatus) => Task[]
  getTodoCount: () => number
  getDoingCount: () => number
  getDoneCount: () => number
}

/**
 * Custom hook for managing tasks with IndexedDB persistence
 * Provides state management and CRUD operations with optimistic updates
 */
export function useTasks(): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load tasks from IndexedDB on mount
  useEffect(() => {
    async function loadTasks() {
      try {
        setLoading(true)
        setError(null)

        // Initialize database
        await initDB()

        // Load all tasks with retry and timeout
        const allTasks = await withTimeout(() => withRetry(() => getAllTasks()), 5000)

        setTasks(allTasks)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load tasks'
        setError(message)
        console.error('Error loading tasks:', err)
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [])

  /**
   * Create a new task with optimistic UI update
   */
  const createTask = useCallback(async (input: CreateTaskInput) => {
    try {
      setError(null)

      // Optimistically create task object
      const optimisticTask: Task = {
        id: `temp-${Date.now()}`, // Temporary ID
        title: input.title.trim(),
        description: input.description.trim(),
        status: 'todo',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      // Update UI immediately
      setTasks(prev => [optimisticTask, ...prev])

      // Persist to database
      const createdTask = await withTimeout(() => withRetry(() => dbCreateTask(input)), 5000)

      // Replace optimistic task with real task
      setTasks(prev => prev.map(t => (t.id === optimisticTask.id ? createdTask : t)))
    } catch (err) {
      // Rollback optimistic update on error
      setTasks(prev => prev.filter(t => !t.id.startsWith('temp-')))

      const message = err instanceof Error ? err.message : 'Failed to create task'
      setError(message)
      throw err
    }
  }, [])

  /**
   * Update an existing task with optimistic UI update
   */
  const updateTask = useCallback(async (input: UpdateTaskInput) => {
    const previousTasks = tasks

    try {
      setError(null)

      // Optimistically update UI
      setTasks(prev =>
        prev.map(task =>
          task.id === input.id
            ? {
                ...task,
                ...(input.title !== undefined && { title: input.title.trim() }),
                ...(input.description !== undefined && {
                  description: input.description.trim(),
                }),
                ...(input.status !== undefined && { status: input.status }),
                updatedAt: Date.now(),
              }
            : task
        )
      )

      // Persist to database
      const updatedTask = await withTimeout(() => withRetry(() => dbUpdateTask(input)), 5000)

      // Update with actual task from database
      setTasks(prev => prev.map(t => (t.id === updatedTask.id ? updatedTask : t)))
    } catch (err) {
      // Rollback on error
      setTasks(previousTasks)

      const message = err instanceof Error ? err.message : 'Failed to update task'
      setError(message)
      throw err
    }
  }, [tasks])

  /**
   * Delete a task with optimistic UI update
   */
  const deleteTask = useCallback(async (id: string) => {
    const previousTasks = tasks

    try {
      setError(null)

      // Optimistically remove from UI
      setTasks(prev => prev.filter(task => task.id !== id))

      // Persist deletion to database
      await withTimeout(() => withRetry(() => dbDeleteTask(id)), 5000)
    } catch (err) {
      // Rollback on error
      setTasks(previousTasks)

      const message = err instanceof Error ? err.message : 'Failed to delete task'
      setError(message)
      throw err
    }
  }, [tasks])

  /**
   * Move a task to a new status with optimistic UI update
   */
  const moveTask = useCallback(async (input: MoveTaskInput) => {
    const previousTasks = tasks

    try {
      setError(null)

      // Optimistically update status
      setTasks(prev =>
        prev.map(task =>
          task.id === input.id
            ? { ...task, status: input.newStatus, updatedAt: Date.now() }
            : task
        )
      )

      // Persist to database
      const movedTask = await withTimeout(() => withRetry(() => dbMoveTask(input)), 5000)

      // Update with actual task from database
      setTasks(prev => prev.map(t => (t.id === movedTask.id ? movedTask : t)))
    } catch (err) {
      // Rollback on error
      setTasks(previousTasks)

      const message = err instanceof Error ? err.message : 'Failed to move task'
      setError(message)
      throw err
    }
  }, [tasks])

  /**
   * Get tasks filtered by status
   */
  const getTasksByStatus = useCallback(
    (status: TaskStatus): Task[] => {
      return tasks.filter(task => task.status === status)
    },
    [tasks]
  )

  /**
   * Get count of tasks in "To Do" status
   */
  const getTodoCount = useCallback((): number => {
    return tasks.filter(task => task.status === 'todo').length
  }, [tasks])

  /**
   * Get count of tasks in "Doing" status
   */
  const getDoingCount = useCallback((): number => {
    return tasks.filter(task => task.status === 'doing').length
  }, [tasks])

  /**
   * Get count of tasks in "Done" status
   */
  const getDoneCount = useCallback((): number => {
    return tasks.filter(task => task.status === 'done').length
  }, [tasks])

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    getTasksByStatus,
    getTodoCount,
    getDoingCount,
    getDoneCount,
  }
}
