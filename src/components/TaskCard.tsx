import { forwardRef } from 'react'
import type { Task } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TaskCardActions } from './TaskCardActions'
import { Draggable } from '@hello-pangea/dnd'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  index: number
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
}

/**
 * TaskCard component - displays a task with title, description, and action menu
 * Supports drag-and-drop for moving between columns
 */
export function TaskCard({ task, index, onEdit, onDelete }: TaskCardProps) {
  const bgColor = {
    todo: 'bg-todo-bg',
    doing: 'bg-doing-bg',
    done: 'bg-done-bg',
  }[task.status]

  const borderColor = {
    todo: 'border-todo-text/20',
    doing: 'border-doing-text/20',
    done: 'border-done-text/20',
  }[task.status]

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            bgColor,
            borderColor,
            'shadow-sm transition-all cursor-grab active:cursor-grabbing',
            snapshot.isDragging && 'shadow-xl ring-2 ring-primary/50 rotate-2 scale-105'
          )}
        >
          <CardHeader className="pb-2 pr-10 relative">
            <CardTitle className="text-base font-semibold text-foreground leading-tight">
              {task.title}
            </CardTitle>
            <div className="absolute top-2 right-2">
              <TaskCardActions
                onEdit={onEdit ? () => onEdit(task) : undefined}
                onDelete={onDelete ? () => onDelete(task.id) : undefined}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
              {task.description}
            </p>
          </CardContent>
        </Card>
      )}
    </Draggable>
  )
}
