import type { Task, TaskStatus } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft, Edit, Trash2 } from 'lucide-react'

interface TaskCardProps {
  task: Task
  onMove: (taskId: string, newStatus: TaskStatus) => Promise<void>
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
}

/**
 * TaskCard component - displays a task with title, description, and action buttons
 * Color changes based on task status (yellow for todo, green for doing/done)
 */
export function TaskCard({ task, onMove, onEdit, onDelete }: TaskCardProps) {
  const bgColor = {
    todo: 'bg-todo-bg',
    doing: 'bg-doing-bg',
    done: 'bg-done-bg',
  }[task.status]

  const handleMove = async (newStatus: TaskStatus) => {
    await onMove(task.id, newStatus)
  }

  return (
    <Card className={`${bgColor} border-gray-300 shadow-sm hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">{task.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 whitespace-pre-wrap mb-4">{task.description}</p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          {/* Edit and Delete Buttons */}
          {onEdit && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onEdit(task)}
              className="text-xs"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(task.id)}
              className="text-xs"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          )}
          {/* Backward movement buttons */}
          {task.status === 'doing' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleMove('todo')}
              className="text-xs"
            >
              <ArrowLeft className="w-3 h-3 mr-1" />
              To Do
            </Button>
          )}
          {task.status === 'done' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleMove('todo')}
                className="text-xs"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                To Do
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleMove('doing')}
                className="text-xs"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                Doing
              </Button>
            </>
          )}

          {/* Forward movement buttons */}
          {task.status === 'todo' && (
            <>
              <Button
                size="sm"
                variant="default"
                onClick={() => handleMove('doing')}
                className="text-xs"
              >
                Doing
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={() => handleMove('done')}
                className="text-xs"
              >
                Done
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </>
          )}
          {task.status === 'doing' && (
            <Button
              size="sm"
              variant="default"
              onClick={() => handleMove('done')}
              className="text-xs"
            >
              Done
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
