import type { TaskStatus } from '@/lib/types'

interface TaskCountersProps {
  todoCount: number
  doingCount: number
  doneCount: number
}

/**
 * TaskCounters component displays three counters for task statuses
 * Shows count of tasks in To Do, Doing, and Done columns
 */
export function TaskCounters({ todoCount, doingCount, doneCount }: TaskCountersProps) {
  return (
    <div className="flex gap-4 justify-center flex-wrap mb-6">
      <CounterBadge label="To Do" count={todoCount} status="todo" />
      <CounterBadge label="Doing" count={doingCount} status="doing" />
      <CounterBadge label="Done" count={doneCount} status="done" />
    </div>
  )
}

interface CounterBadgeProps {
  label: string
  count: number
  status: TaskStatus
}

function CounterBadge({ label, count, status }: CounterBadgeProps) {
  const bgColor = {
    todo: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    doing: 'bg-green-100 text-green-800 border-green-300',
    done: 'bg-green-100 text-green-800 border-green-300',
  }[status]

  return (
    <div
      className={`px-4 py-2 rounded-lg border-2 font-semibold text-sm transition-colors ${bgColor}`}
    >
      {label}: {count}
    </div>
  )
}
