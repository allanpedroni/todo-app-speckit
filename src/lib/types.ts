/**
 * Task workflow status
 */
export type TaskStatus = 'todo' | 'doing' | 'done'

/**
 * Represents a user's work item that moves through the Kanban workflow
 */
export interface Task {
  /**
   * Unique identifier for the task
   * Format: UUID v4 or timestamp-based ID
   * Generated client-side on creation
   */
  id: string

  /**
   * Short title summarizing the task
   * Constraints: Required, 1-500 characters
   * Validation: Must not be empty or whitespace-only
   */
  title: string

  /**
   * Detailed description of the task
   * Constraints: Required, 1-2000 characters
   * Validation: Must not be empty or whitespace-only
   */
  description: string

  /**
   * Current workflow status
   * Values: 'todo' | 'doing' | 'done'
   * Default: 'todo' (on creation)
   */
  status: TaskStatus

  /**
   * Creation timestamp
   * Format: Unix timestamp (milliseconds)
   * Used for: Default sort order (newest first)
   */
  createdAt: number

  /**
   * Last modification timestamp
   * Format: Unix timestamp (milliseconds)
   * Updated on: Edit or status change
   */
  updatedAt: number

  // Future extensibility (Phase 2+, not implemented in v1)
  // color?: string        // Custom card color
  // labels?: string[]     // Tags/categories
  // dueDate?: number      // Due date timestamp
  // priority?: number     // Priority level
}

/**
 * Payload for creating a new task
 * Omits auto-generated fields
 */
export type CreateTaskInput = Pick<Task, 'title' | 'description'>

/**
 * Payload for updating an existing task
 * All fields optional except ID
 */
export type UpdateTaskInput = Partial<Pick<Task, 'title' | 'description' | 'status'>> & {
  id: string
}

/**
 * Payload for moving a task between statuses
 */
export type MoveTaskInput = {
  id: string
  newStatus: TaskStatus
}

/**
 * Validation result
 */
export type ValidationResult = {
  valid: boolean
  errors: string[]
}

/**
 * Custom error classes
 */
export class ValidationError extends Error {
  errors: string[]

  constructor(errors: string[]) {
    super(errors.join(', '))
    this.name = 'ValidationError'
    this.errors = errors
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class StorageError extends Error {
  cause?: Error

  constructor(message: string, cause?: Error) {
    super(message)
    this.name = 'StorageError'
    this.cause = cause
  }
}
