import type { ReactNode } from 'react'
import type { TaskStatus } from '@/lib/types'
import { Droppable } from '@hello-pangea/dnd'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  title: string
  status: TaskStatus
  children?: ReactNode
}

/**
 * KanbanColumn component - reusable column container for Kanban board
 * Displays column title and renders children (task cards)
 * Supports drag-and-drop as a drop target
 */
export function KanbanColumn({ title, status, children }: KanbanColumnProps) {
  const bgColor = {
    todo: 'bg-todo-bg',
    doing: 'bg-doing-bg',
    done: 'bg-done-bg',
  }[status]

  const borderColor = {
    todo: 'border-todo-text/30',
    doing: 'border-doing-text/30',
    done: 'border-done-text/30',
  }[status]

  return (
    <div className={cn('flex flex-col rounded-lg border h-full min-h-0', borderColor, bgColor, 'p-4')}>
      <h2 className="text-xl font-bold mb-4 text-foreground flex-shrink-0">{title}</h2>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex flex-col gap-3 flex-1 min-h-0 rounded-md transition-colors p-2 overflow-y-auto',
              snapshot.isDraggingOver && 'bg-primary/5 ring-2 ring-primary/20'
            )}
          >
            {children}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
