import { openDB, type IDBPDatabase } from 'idb'
import type {
  Task,
  TaskStatus,
  CreateTaskInput,
  UpdateTaskInput,
  MoveTaskInput,
  ValidationResult,
} from './types'
import { ValidationError, NotFoundError, StorageError } from './types'

const DB_NAME = 'kanban-board'
const DB_VERSION = 1
const STORE_NAME = 'tasks'

let dbInstance: IDBPDatabase | null = null

/**
 * Initialize and open the IndexedDB database
 * Creates the tasks object store and indexes on first run
 */
export async function initDB(): Promise<IDBPDatabase> {
  if (dbInstance) {
    return dbInstance
  }

  try {
    dbInstance = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // Version 1: Initial schema
        if (oldVersion < 1) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
          })

          // Index for querying by status
          store.createIndex('status', 'status', { unique: false })

          // Index for sorting by creation date
          store.createIndex('createdAt', 'createdAt', { unique: false })
        }

        // Future versions:
        // if (oldVersion < 2) {
        //   // Add color field support
        //   const store = transaction.objectStore(STORE_NAME)
        //   // No schema changes needed - optional field
        // }
      },
    })

    return dbInstance
  } catch (error) {
    throw new StorageError(
      'Failed to initialize IndexedDB',
      error instanceof Error ? error : undefined
    )
  }
}

/**
 * Get the database instance, initializing if necessary
 */
async function getDB(): Promise<IDBPDatabase> {
  if (!dbInstance) {
    return initDB()
  }
  return dbInstance
}

/**
 * Utility: Retry an operation with exponential backoff
 * @param operation - Async operation to retry
 * @param retries - Number of retry attempts (default: 3)
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  retries = 3
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < retries) {
        // Exponential backoff: 100ms, 200ms, 400ms
        const delay = 100 * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw new StorageError(
    `Operation failed after ${retries} retries`,
    lastError || undefined
  )
}

/**
 * Utility: Add timeout to an operation
 * @param operation - Async operation to wrap
 * @param timeoutMs - Timeout in milliseconds (default: 5000)
 */
export async function withTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs = 5000
): Promise<T> {
  return Promise.race([
    operation(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new StorageError('Operation timed out')), timeoutMs)
    ),
  ])
}

/**
 * Generate a unique ID for a task
 * Uses crypto.randomUUID() if available, falls back to timestamp-based ID
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback: timestamp + random string
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Validate task creation input
 */
function validateCreateTask(input: CreateTaskInput): ValidationResult {
  const errors: string[] = []

  // Title validation
  if (!input.title || input.title.trim().length === 0) {
    errors.push('Título é obrigatório')
  }
  if (input.title && input.title.length > 500) {
    errors.push('Título deve ter no máximo 500 caracteres')
  }

  // Description validation
  if (!input.description || input.description.trim().length === 0) {
    errors.push('Descrição é obrigatória')
  }
  if (input.description && input.description.length > 2000) {
    errors.push('Descrição deve ter no máximo 2000 caracteres')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate task update input
 */
function validateUpdateTask(input: UpdateTaskInput): ValidationResult {
  const errors: string[] = []

  // Title validation (if provided)
  if (input.title !== undefined) {
    if (input.title.trim().length === 0) {
      errors.push('Título não pode ser vazio')
    }
    if (input.title.length > 500) {
      errors.push('Título deve ter no máximo 500 caracteres')
    }
  }

  // Description validation (if provided)
  if (input.description !== undefined) {
    if (input.description.trim().length === 0) {
      errors.push('Descrição não pode ser vazia')
    }
    if (input.description.length > 2000) {
      errors.push('Descrição deve ter no máximo 2000 caracteres')
    }
  }

  // Status validation (if provided)
  if (input.status !== undefined) {
    if (!['todo', 'doing', 'done'].includes(input.status)) {
      errors.push('Status inválido')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Create a new task
 * Validates input, generates ID and timestamps, saves to IndexedDB
 */
export async function createTask(input: CreateTaskInput): Promise<Task> {
  const validation = validateCreateTask(input)
  if (!validation.valid) {
    throw new ValidationError(validation.errors)
  }

  const task: Task = {
    id: generateId(),
    title: input.title.trim(),
    description: input.description.trim(),
    status: 'todo',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  try {
    const db = await getDB()
    await db.add(STORE_NAME, task)
    return task
  } catch (error) {
    throw new StorageError(
      'Failed to create task',
      error instanceof Error ? error : undefined
    )
  }
}

/**
 * Get all tasks from the database
 */
export async function getAllTasks(): Promise<Task[]> {
  try {
    const db = await getDB()
    return db.getAll(STORE_NAME)
  } catch (error) {
    throw new StorageError(
      'Failed to retrieve tasks',
      error instanceof Error ? error : undefined
    )
  }
}

/**
 * Get tasks filtered by status
 * @param status - The status to filter by ('todo', 'doing', or 'done')
 */
export async function getTasksByStatus(status: TaskStatus): Promise<Task[]> {
  try {
    const db = await getDB()
    return db.getAllFromIndex(STORE_NAME, 'status', status)
  } catch (error) {
    throw new StorageError(
      `Failed to retrieve tasks with status ${status}`,
      error instanceof Error ? error : undefined
    )
  }
}

/**
 * Update an existing task
 * Validates input, updates timestamps, saves to IndexedDB
 */
export async function updateTask(input: UpdateTaskInput): Promise<Task> {
  const validation = validateUpdateTask(input)
  if (!validation.valid) {
    throw new ValidationError(validation.errors)
  }

  try {
    const db = await getDB()
    const existing = await db.get(STORE_NAME, input.id)

    if (!existing) {
      throw new NotFoundError(`Task ${input.id} not found`)
    }

    const updated: Task = {
      ...existing,
      ...(input.title !== undefined && { title: input.title.trim() }),
      ...(input.description !== undefined && { description: input.description.trim() }),
      ...(input.status !== undefined && { status: input.status }),
      updatedAt: Date.now(),
    }

    await db.put(STORE_NAME, updated)

    return updated
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error
    }
    throw new StorageError(
      'Failed to update task',
      error instanceof Error ? error : undefined
    )
  }
}

/**
 * Delete a task by ID
 */
export async function deleteTask(id: string): Promise<void> {
  try {
    const db = await getDB()
    const existing = await db.get(STORE_NAME, id)

    if (!existing) {
      throw new NotFoundError(`Task ${id} not found`)
    }

    await db.delete(STORE_NAME, id)
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error
    }
    throw new StorageError(
      'Failed to delete task',
      error instanceof Error ? error : undefined
    )
  }
}

/**
 * Move a task to a new status
 * Wrapper around updateTask for convenience
 */
export async function moveTask(input: MoveTaskInput): Promise<Task> {
  return updateTask({
    id: input.id,
    status: input.newStatus,
  })
}
