import { useState } from 'react'
import type { Task, TaskStatus } from '@/lib/types'
import { useTasks } from '@/hooks/useTasks'
import { TaskCounters } from './TaskCounters'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'
import { TaskForm } from './TaskForm'
import { TaskEditForm } from './TaskEditForm'
import { DeleteConfirmation } from './DeleteConfirmation'
import { Button } from '@/components/ui/button'
import { DragDropContext } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'

/**
 * KanbanBoard component - main container for the Kanban board
 * Displays title, task counters, and three columns (To Do, Doing, Done)
 * Supports drag-and-drop for moving tasks between columns
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
        <div className="text-xl text-muted-foreground">Loading tasks...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-destructive">Error: {error}</div>
      </div>
    )
  }

  const todoTasks = getTasksByStatus('todo')
  const doingTasks = getTasksByStatus('doing')
  const doneTasks = getTasksByStatus('done')

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    // Dropped outside any droppable
    if (!destination) return

    // Dropped in same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    // Move task to new status
    const newStatus = destination.droppableId as TaskStatus
    moveTask({ id: draggableId, newStatus })
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
    <div className="h-screen flex flex-col px-4 py-6 max-w-7xl mx-auto overflow-hidden">
      {/* Title */}
      <h1 className="text-4xl font-bold text-center mb-6 text-foreground flex-shrink-0">TO-DO</h1>

      {/* Add Task Button */}
      <div className="flex justify-center mb-4 flex-shrink-0">
        <Button onClick={() => setIsFormOpen(true)} size="lg">
          Add Task
        </Button>
      </div>

      {/* Task Counters */}
      <div className="flex-shrink-0">
        <TaskCounters
          todoCount={getTodoCount()}
          doingCount={getDoingCount()}
          doneCount={getDoneCount()}
        />
      </div>

      {/* Kanban Columns with Drag and Drop */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
          <KanbanColumn title="To Do" status="todo">
            {todoTasks.length === 0 ? (
              <p className="text-muted-foreground text-center mt-8">No tasks yet</p>
            ) : (
              todoTasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              ))
            )}
          </KanbanColumn>

          <KanbanColumn title="Doing" status="doing">
            {doingTasks.length === 0 ? (
              <p className="text-muted-foreground text-center mt-8">No tasks yet</p>
            ) : (
              doingTasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              ))
            )}
          </KanbanColumn>

          <KanbanColumn title="Done" status="done">
            {doneTasks.length === 0 ? (
              <p className="text-muted-foreground text-center mt-8">No tasks yet</p>
            ) : (
              doneTasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              ))
            )}
          </KanbanColumn>
        </div>
      </DragDropContext>

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
