# Data Model: Kanban Task Board

**Feature**: 001-kanban-task-board
**Date**: 2025-11-24
**Status**: Phase 1 Design

## Overview

This document defines the data structures, storage schema, and state transitions for the Kanban Task Board application. The application uses IndexedDB for client-side persistence with a single entity type: **Task**.

## Entities

### Task

Represents a user's work item that moves through the Kanban workflow.

#### TypeScript Interface

```typescript
interface Task {
  /**
   * Unique identifier for the task
   * Format: UUID v4 or timestamp-based ID
   * Generated client-side on creation
   */
  id: string;

  /**
   * Short title summarizing the task
   * Constraints: Required, 1-500 characters
   * Validation: Must not be empty or whitespace-only
   */
  title: string;

  /**
   * Detailed description of the task
   * Constraints: Required, 1-2000 characters
   * Validation: Must not be empty or whitespace-only
   */
  description: string;

  /**
   * Current workflow status
   * Values: 'todo' | 'doing' | 'done'
   * Default: 'todo' (on creation)
   */
  status: TaskStatus;

  /**
   * Creation timestamp
   * Format: Unix timestamp (milliseconds)
   * Used for: Default sort order (newest first)
   */
  createdAt: number;

  /**
   * Last modification timestamp
   * Format: Unix timestamp (milliseconds)
   * Updated on: Edit or status change
   */
  updatedAt: number;

  // Future extensibility (Phase 2+, not implemented in v1)
  // color?: string;        // Custom card color
  // labels?: string[];     // Tags/categories
  // dueDate?: number;      // Due date timestamp
  // priority?: number;     // Priority level
}
```

#### Type Definitions

```typescript
/**
 * Task workflow status
 */
type TaskStatus = 'todo' | 'doing' | 'done';

/**
 * Payload for creating a new task
 * Omits auto-generated fields
 */
type CreateTaskInput = Pick<Task, 'title' | 'description'>;

/**
 * Payload for updating an existing task
 * All fields optional except ID
 */
type UpdateTaskInput = Partial<Pick<Task, 'title' | 'description' | 'status'>> & {
  id: string;
};

/**
 * Payload for moving a task between statuses
 */
type MoveTaskInput = {
  id: string;
  newStatus: TaskStatus;
};
```

## State Transitions

### Task Status Flow

```text
┌────────┐         ┌────────┐         ┌────────┐
│  todo  │ ──────> │ doing  │ ──────> │  done  │
└────────┘         └────────┘         └────────┘
    ^                  │                   │
    │                  │                   │
    └──────────────────┴───────────────────┘
           (bidirectional movement)
```

### Valid Status Transitions

All transitions are bidirectional - tasks can move in any direction:

| From | To | Trigger | UI Action |
|------|----|----|-----------|
| todo | doing | User clicks "Move to Doing" button | Card moves to Doing column, color changes to light green |
| doing | done | User clicks "Move to Done" button | Card moves to Done column, color stays light green |
| done | doing | User clicks "Move to Doing" button | Card moves back to Doing column, color stays light green |
| doing | todo | User clicks "Move to To Do" button | Card moves back to To Do column, color changes to light yellow |
| todo | done | User clicks "Move to Done" button (skip Doing) | Card moves to Done column, color changes to light green |
| done | todo | User clicks "Move to To Do" button (skip Doing) | Card moves back to To Do column, color changes to light yellow |

### Transition Rules

1. **No restrictions**: Tasks can move between any status in any direction
2. **Atomic operations**: Status updates are atomic (IndexedDB transaction)
3. **Timestamp update**: `updatedAt` field is updated on every status change
4. **Counter update**: UI totalizadores are updated immediately after transition

## Validation Rules

### Creation Validation

```typescript
function validateCreateTask(input: CreateTaskInput): ValidationResult {
  const errors: string[] = [];

  // Title validation
  if (!input.title || input.title.trim().length === 0) {
    errors.push('Título é obrigatório');
  }
  if (input.title && input.title.length > 500) {
    errors.push('Título deve ter no máximo 500 caracteres');
  }

  // Description validation
  if (!input.description || input.description.trim().length === 0) {
    errors.push('Descrição é obrigatória');
  }
  if (input.description && input.description.length > 2000) {
    errors.push('Descrição deve ter no máximo 2000 caracteres');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

### Update Validation

```typescript
function validateUpdateTask(input: UpdateTaskInput): ValidationResult {
  const errors: string[] = [];

  // Title validation (if provided)
  if (input.title !== undefined) {
    if (input.title.trim().length === 0) {
      errors.push('Título não pode ser vazio');
    }
    if (input.title.length > 500) {
      errors.push('Título deve ter no máximo 500 caracteres');
    }
  }

  // Description validation (if provided)
  if (input.description !== undefined) {
    if (input.description.trim().length === 0) {
      errors.push('Descrição não pode ser vazia');
    }
    if (input.description.length > 2000) {
      errors.push('Descrição deve ter no máximo 2000 caracteres');
    }
  }

  // Status validation (if provided)
  if (input.status !== undefined) {
    if (!['todo', 'doing', 'done'].includes(input.status)) {
      errors.push('Status inválido');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

## IndexedDB Schema

### Database Configuration

```typescript
const DB_NAME = 'kanban-board';
const DB_VERSION = 1;
const STORE_NAME = 'tasks';
```

### Object Store Definition

```typescript
// Schema creation in idb
const db = await openDB(DB_NAME, DB_VERSION, {
  upgrade(db, oldVersion, newVersion, transaction) {
    // Version 1: Initial schema
    if (oldVersion < 1) {
      const store = db.createObjectStore(STORE_NAME, {
        keyPath: 'id',
      });

      // Index for querying by status
      store.createIndex('status', 'status', { unique: false });

      // Index for sorting by creation date
      store.createIndex('createdAt', 'createdAt', { unique: false });
    }

    // Future versions:
    // if (oldVersion < 2) {
    //   // Add color field support
    //   const store = transaction.objectStore(STORE_NAME);
    //   // No schema changes needed - optional field
    // }
  },
});
```

### Indexes

| Index Name | Field | Unique | Purpose |
|------------|-------|--------|---------|
| (primary key) | id | Yes | Direct task lookup |
| status | status | No | Filter tasks by status (for column rendering) |
| createdAt | createdAt | No | Sort tasks by creation date |

## Data Operations

### CRUD Operations

#### Create

```typescript
async function createTask(input: CreateTaskInput): Promise<Task> {
  const validation = validateCreateTask(input);
  if (!validation.valid) {
    throw new ValidationError(validation.errors);
  }

  const task: Task = {
    id: generateId(), // UUID v4 or crypto.randomUUID()
    title: input.title.trim(),
    description: input.description.trim(),
    status: 'todo',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const db = await getDB();
  await db.add(STORE_NAME, task);

  return task;
}
```

#### Read

```typescript
// Get single task
async function getTask(id: string): Promise<Task | undefined> {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}

// Get all tasks
async function getAllTasks(): Promise<Task[]> {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

// Get tasks by status
async function getTasksByStatus(status: TaskStatus): Promise<Task[]> {
  const db = await getDB();
  return db.getAllFromIndex(STORE_NAME, 'status', status);
}
```

#### Update

```typescript
async function updateTask(input: UpdateTaskInput): Promise<Task> {
  const validation = validateUpdateTask(input);
  if (!validation.valid) {
    throw new ValidationError(validation.errors);
  }

  const db = await getDB();
  const existing = await db.get(STORE_NAME, input.id);

  if (!existing) {
    throw new NotFoundError(`Task ${input.id} not found`);
  }

  const updated: Task = {
    ...existing,
    ...(input.title !== undefined && { title: input.title.trim() }),
    ...(input.description !== undefined && { description: input.description.trim() }),
    ...(input.status !== undefined && { status: input.status }),
    updatedAt: Date.now(),
  };

  await db.put(STORE_NAME, updated);

  return updated;
}
```

#### Delete

```typescript
async function deleteTask(id: string): Promise<void> {
  const db = await getDB();
  const existing = await db.get(STORE_NAME, id);

  if (!existing) {
    throw new NotFoundError(`Task ${input.id} not found`);
  }

  await db.delete(STORE_NAME, id);
}
```

#### Move (Status Change)

```typescript
async function moveTask(input: MoveTaskInput): Promise<Task> {
  return updateTask({
    id: input.id,
    status: input.newStatus,
  });
}
```

## Data Flow Architecture

### Component → Data Flow

```text
┌─────────────────┐
│ React Component │
└────────┬────────┘
         │
         ├──> useTasks() hook
         │         │
         │         ├──> Custom hook manages local state
         │         │
         │         └──> Calls DB operations (lib/db.ts)
         │                    │
         │                    ├──> idb wrapper
         │                    │
         │                    └──> IndexedDB (browser)
         │
         └──> Component re-renders with new data
```

### State Synchronization

1. **Optimistic UI Updates**:
   - Update local React state immediately
   - Show change to user instantly
   - Perform IndexedDB operation asynchronously
   - Rollback local state if DB operation fails

```typescript
// Example: Optimistic task creation
const createTask = async (input: CreateTaskInput) => {
  // 1. Create task object
  const newTask = {
    id: generateId(),
    ...input,
    status: 'todo' as TaskStatus,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // 2. Update UI immediately (optimistic)
  setTasks(prev => [newTask, ...prev]);

  try {
    // 3. Persist to IndexedDB
    await saveTaskToDB(newTask);
  } catch (error) {
    // 4. Rollback on failure
    setTasks(prev => prev.filter(t => t.id !== newTask.id));
    throw error;
  }
};
```

## Future Extensibility

### Schema Evolution (v2+)

The Task interface is designed for extension without breaking changes:

#### Version 2: Custom Colors

```typescript
interface Task {
  // ... existing fields
  color?: string; // Hex color code, e.g., "#FFE0B2"
}
```

**Migration**: No data migration needed (optional field, defaults to status-based color)

#### Version 3: Labels/Tags

```typescript
interface Task {
  // ... existing fields
  labels?: string[]; // Array of label strings
}
```

**Migration**: No data migration needed (optional field, defaults to empty array)

**IndexedDB Update**:

```typescript
if (oldVersion < 3) {
  const store = transaction.objectStore(STORE_NAME);
  store.createIndex('labels', 'labels', { unique: false, multiEntry: true });
}
```

### Backward Compatibility Strategy

1. **Optional Fields**: All new fields are optional with sensible defaults
2. **Version Checks**: Code checks for field existence before using
3. **Graceful Degradation**: App functions without extended features
4. **Migration Scripts**: IndexedDB upgrade handlers preserve existing data

## Error Handling

### Error Types

```typescript
class ValidationError extends Error {
  constructor(public errors: string[]) {
    super(errors.join(', '));
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

class StorageError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'StorageError';
  }
}
```

### Retry & Timeout (Constitution III.2, III.4)

```typescript
// Wrap DB operations with retry and timeout
async function withResilience<T>(
  operation: () => Promise<T>,
  options = { retries: 3, timeout: 5000 }
): Promise<T> {
  return withTimeout(
    withRetry(operation, options.retries),
    options.timeout
  );
}

// Usage
const task = await withResilience(() => createTask(input));
```

## Data Integrity

### Constraints

1. **Uniqueness**: Task IDs are globally unique (UUID v4)
2. **Required Fields**: title, description, status, createdAt, updatedAt must always be present
3. **Status Validity**: status must be one of: 'todo', 'doing', 'done'
4. **Timestamp Validity**: createdAt and updatedAt must be positive integers

### Consistency Rules

1. **updatedAt ≥ createdAt**: Updated timestamp cannot be earlier than creation
2. **Status Enum**: Status must match one of the defined enum values
3. **Non-empty Strings**: title and description cannot be empty after trimming

## Performance Considerations

### Query Optimization

1. **Indexed Queries**: Use status index for column filtering
2. **Batch Operations**: Load all tasks once on app init, manage in memory
3. **Lazy Rendering**: Virtualize task list if >100 tasks (future optimization)

### Memory Management

1. **Task Limit**: Support up to 100 tasks without performance degradation (spec requirement)
2. **No Pagination**: All tasks loaded into memory (acceptable for 100 tasks)
3. **Cleanup**: No automatic task deletion (user-controlled only)

## Testing Strategy

### Unit Tests

```typescript
describe('Task Validation', () => {
  it('rejects empty title', () => {
    const result = validateCreateTask({ title: '', description: 'test' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Título é obrigatório');
  });

  it('accepts valid task', () => {
    const result = validateCreateTask({ title: 'Test', description: 'Description' });
    expect(result.valid).toBe(true);
  });
});
```

### Integration Tests

```typescript
describe('Task CRUD Operations', () => {
  it('creates and retrieves task', async () => {
    const created = await createTask({ title: 'Test', description: 'Desc' });
    const retrieved = await getTask(created.id);
    expect(retrieved).toEqual(created);
  });

  it('moves task between statuses', async () => {
    const task = await createTask({ title: 'Test', description: 'Desc' });
    const moved = await moveTask({ id: task.id, newStatus: 'doing' });
    expect(moved.status).toBe('doing');
  });
});
```

## Summary

- **Entity**: Task (single entity type)
- **Storage**: IndexedDB with idb wrapper
- **Validation**: Required fields enforced, length limits applied
- **State Transitions**: Fully bidirectional between todo/doing/done
- **Extensibility**: Optional fields for future features (colors, labels)
- **Performance**: Optimized for ~100 tasks, indexed queries
- **Resilience**: Retry logic, timeouts, error handling

**Next Phase**: Generate API contracts (IndexedDB schema JSON) and quickstart guide.
