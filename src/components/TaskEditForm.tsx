import { useState, useEffect } from 'react'
import type { Task, UpdateTaskInput } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface TaskEditFormProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: UpdateTaskInput) => Promise<void>
}

/**
 * TaskEditForm component - form for editing existing tasks
 * Pre-fills with current task data and includes validation
 */
export function TaskEditForm({ task, open, onOpenChange, onSubmit }: TaskEditFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pre-fill form when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
      setErrors({})
    }
  }, [task])

  const validateForm = (): boolean => {
    const newErrors: { title?: string; description?: string } = {}

    if (!title.trim()) {
      newErrors.title = 'Título é obrigatório'
    }

    if (!description.trim()) {
      newErrors.description = 'Descrição é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!task || !validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        id: task.id,
        title,
        description,
      })

      onOpenChange(false)
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
    }
    setErrors({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the task title and description below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-title" className="text-sm font-medium">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="edit-title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter task title"
                className={errors.title ? 'border-red-500' : ''}
                maxLength={500}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            <div className="grid gap-2">
              <label htmlFor="edit-description" className="text-sm font-medium">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Enter task description"
                className={errors.description ? 'border-red-500' : ''}
                rows={4}
                maxLength={2000}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
