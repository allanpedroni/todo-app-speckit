import type { Task } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TaskCardProps {
  task: Task
}

/**
 * TaskCard component - displays a task with title, description, and action buttons
 * Color changes based on task status (yellow for todo, green for doing/done)
 */
export function TaskCard({ task }: TaskCardProps) {
  const bgColor = {
    todo: 'bg-todo-bg',
    doing: 'bg-doing-bg',
    done: 'bg-done-bg',
  }[task.status]

  return (
    <Card className={`${bgColor} border-gray-300 shadow-sm hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">{task.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{task.description}</p>
      </CardContent>
    </Card>
  )
}
