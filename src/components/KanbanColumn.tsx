import type { ReactNode } from 'react'
import type { TaskStatus } from '@/lib/types'

interface KanbanColumnProps {
  title: string
  status: TaskStatus
  children?: ReactNode
}

/**
 * KanbanColumn component - reusable column container for Kanban board
 * Displays column title and renders children (task cards)
 */
export function KanbanColumn({ title, status, children }: KanbanColumnProps) {
  const bgColor = {
    todo: 'bg-yellow-50',
    doing: 'bg-green-50',
    done: 'bg-green-50',
  }[status]

  return (
    <div className={`flex flex-col rounded-lg border-2 border-gray-300 ${bgColor} p-4 min-h-[400px]`}>
      <h2 className="text-xl font-bold mb-4 text-gray-800">{title}</h2>
      <div className="flex flex-col gap-3 flex-1">{children}</div>
    </div>
  )
}
