import { useTasks } from '@/hooks/useTasks'
import { TaskCounters } from './TaskCounters'
import { KanbanColumn } from './KanbanColumn'

/**
 * KanbanBoard component - main container for the Kanban board
 * Displays title, task counters, and three columns (To Do, Doing, Done)
 */
export function KanbanBoard() {
  const { loading, error, getTodoCount, getDoingCount, getDoneCount, getTasksByStatus } =
    useTasks()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading tasks...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    )
  }

  const todoTasks = getTasksByStatus('todo')
  const doingTasks = getTasksByStatus('doing')
  const doneTasks = getTasksByStatus('done')

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Title */}
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">TO-DO</h1>

      {/* Task Counters */}
      <TaskCounters
        todoCount={getTodoCount()}
        doingCount={getDoingCount()}
        doneCount={getDoneCount()}
      />

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KanbanColumn title="To Do" status="todo">
          {todoTasks.length === 0 && (
            <p className="text-gray-400 text-center mt-8">No tasks yet</p>
          )}
        </KanbanColumn>

        <KanbanColumn title="Doing" status="doing">
          {doingTasks.length === 0 && (
            <p className="text-gray-400 text-center mt-8">No tasks yet</p>
          )}
        </KanbanColumn>

        <KanbanColumn title="Done" status="done">
          {doneTasks.length === 0 && (
            <p className="text-gray-400 text-center mt-8">No tasks yet</p>
          )}
        </KanbanColumn>
      </div>
    </div>
  )
}
