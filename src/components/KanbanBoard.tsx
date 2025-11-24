import { useState } from 'react'
import type { Task } from '@/lib/types'
import { useTasks } from '@/hooks/useTasks'
import { TaskCounters } from './TaskCounters'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'
import { TaskForm } from './TaskForm'
import { TaskEditForm } from './TaskEditForm'
import { DeleteConfirmation } from './DeleteConfirmation'
import { Button } from '@/components/ui/button'

/**
 * KanbanBoard component - main container for the Kanban board
 * Displays title, task counters, and three columns (To Do, Doing, Done)
 */
export function KanbanBoard() {
  const {
    loading,
    error,
    getTodoCount,
    getDoingCount,
    getDoneCount,
    getTasksByStatus,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  } = useTasks()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)

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

  const handleMoveTask = async (taskId: string, newStatus: import('@/lib/types').TaskStatus) => {
    await moveTask({ id: taskId, newStatus })
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsEditFormOpen(true)
  }

  const handleDeleteTask = (taskId: string) => {
    const task = [...todoTasks, ...doingTasks, ...doneTasks].find(t => t.id === taskId)
    if (task) {
      setDeletingTask(task)
      setIsDeleteDialogOpen(true)
    }
  }

  const confirmDelete = async () => {
    if (deletingTask) {
      await deleteTask(deletingTask.id)
      setIsDeleteDialogOpen(false)
      setDeletingTask(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Title */}
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">TO-DO</h1>

      {/* Add Task Button */}
      <div className="flex justify-center mb-6">
        <Button onClick={() => setIsFormOpen(true)} size="lg">
          Add Task
        </Button>
      </div>

      {/* Task Counters */}
      <TaskCounters
        todoCount={getTodoCount()}
        doingCount={getDoingCount()}
        doneCount={getDoneCount()}
      />

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KanbanColumn title="To Do" status="todo">
          {todoTasks.length === 0 ? (
            <p className="text-gray-400 text-center mt-8">No tasks yet</p>
          ) : (
            todoTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onMove={handleMoveTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))
          )}
        </KanbanColumn>

        <KanbanColumn title="Doing" status="doing">
          {doingTasks.length === 0 ? (
            <p className="text-gray-400 text-center mt-8">No tasks yet</p>
          ) : (
            doingTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onMove={handleMoveTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))
          )}
        </KanbanColumn>

        <KanbanColumn title="Done" status="done">
          {doneTasks.length === 0 ? (
            <p className="text-gray-400 text-center mt-8">No tasks yet</p>
          ) : (
            doneTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onMove={handleMoveTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))
          )}
        </KanbanColumn>
      </div>

      {/* Task Form Dialog */}
      <TaskForm open={isFormOpen} onOpenChange={setIsFormOpen} onSubmit={createTask} />

      {/* Task Edit Form Dialog */}
      <TaskEditForm
        task={editingTask}
        open={isEditFormOpen}
        onOpenChange={setIsEditFormOpen}
        onSubmit={updateTask}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        taskTitle={deletingTask?.title || ''}
      />
    </div>
  )
}
