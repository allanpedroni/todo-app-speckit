# Implementation Tasks: Kanban Task Board

**Feature**: 001-kanban-task-board
**Branch**: `001-kanban-task-board`
**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)
**Date**: 2025-11-24

## Overview

Este documento detalha todas as tarefas necessárias para implementar o Kanban Task Board, organizado por User Story para permitir desenvolvimento e teste independente de cada incremento funcional.

**Total de Tasks**: 52
**User Stories**: 6 (2× P1, 2× P2, 2× P3)
**Estimated Completion**: 3-5 dias (desenvolvedor individual)

## Implementation Strategy

### MVP Approach

O MVP consiste em **User Story 1 + User Story 2** (Phase 3 + Phase 4), entregando um quadro Kanban funcional onde o usuário pode visualizar a estrutura e criar tarefas. Este MVP é imediatamente útil e testável.

### Incremental Delivery

Cada User Story representa um incremento independentemente testável:
- **US1 (P1)**: Interface visual completa (sem funcionalidade)
- **US2 (P1)**: Criação de tarefas (primeira funcionalidade real)
- **US6 (P2)**: Persistência (torna o app utilizável a longo prazo)
- **US3 (P2)**: Movimentação (Kanban completo)
- **US4 (P3)**: Edição (melhoria de usabilidade)
- **US5 (P3)**: Exclusão (limpeza)

### Parallel Execution

Tasks marcadas com `[P]` podem ser executadas em paralelo quando não dependem de tasks incompletas.

---

## Phase 1: Project Setup

**Goal**: Initialize Vite + React + TypeScript project with all dependencies

**Duration**: ~30 min

### Tasks

- [X] T001 Create Vite project with React TypeScript template in project root
- [X] T002 [P] Install core dependencies (react, react-dom) via npm or pnpm
- [X] T003 [P] Install and configure Tailwind CSS (tailwindcss, postcss, autoprefixer) and create tailwind.config.js
- [X] T004 [P] Install IndexedDB wrapper (idb) via npm
- [X] T005 [P] Install shadcn/ui dependencies (class-variance-authority, clsx, tailwind-merge, lucide-react)
- [X] T006 Initialize shadcn/ui with `npx shadcn-ui@latest init` and create components.json
- [X] T007 Install shadcn/ui components (button, card, dialog, input, textarea, alert-dialog) via CLI
- [X] T008 [P] Configure TypeScript path aliases in tsconfig.json and vite.config.ts
- [X] T009 [P] Install testing dependencies (vitest, @vitest/ui, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, fake-indexeddb, jsdom)
- [X] T010 Create vitest.config.ts and test setup file at src/test/setup.ts
- [X] T011 [P] Install and configure ESLint and Prettier (.eslintrc.cjs, .prettierrc)
- [X] T012 Update package.json scripts (dev, build, preview, test, test:ui, lint, format)
- [X] T013 Create project folder structure (src/components/ui, src/lib, src/hooks, src/test)
- [X] T014 Configure Tailwind custom colors (todo-bg, doing-bg, done-bg) in tailwind.config.js
- [X] T015 Update src/index.css with Tailwind directives and base styles

**Verification**: Run `npm run dev` and confirm app starts without errors. Run `npm run lint` and `npm test` to verify tooling.

---

## Phase 2: Foundational Layer

**Goal**: Implement core data structures and IndexedDB operations (blocks all user stories)

**Duration**: ~1-2 hours

### Tasks

- [X] T016 Define TypeScript types and interfaces in src/lib/types.ts (Task, TaskStatus, CreateTaskInput, UpdateTaskInput, MoveTaskInput)
- [X] T017 Implement IndexedDB initialization and database schema in src/lib/db.ts (initDB with version 1, tasks object store)
- [X] T018 Implement withRetry utility function for IndexedDB operations in src/lib/db.ts
- [X] T019 Implement withTimeout utility function for IndexedDB operations in src/lib/db.ts
- [X] T020 Implement createTask function in src/lib/db.ts (with validation, ID generation, timestamps)
- [X] T021 [P] Implement getAllTasks function in src/lib/db.ts
- [X] T022 [P] Implement getTasksByStatus function in src/lib/db.ts
- [X] T023 [P] Implement updateTask function in src/lib/db.ts (with validation, updatedAt)
- [X] T024 [P] Implement deleteTask function in src/lib/db.ts
- [X] T025 [P] Implement moveTask function in src/lib/db.ts (wrapper for updateTask)
- [X] T026 Create custom useTasks hook in src/hooks/useTasks.ts (state management, load/create/update/delete/move operations)

**Verification**: Run unit tests for db.ts functions (if tests created). Manually call `initDB()` in console to verify database creation.

---

## Phase 3: User Story 1 - View Empty Kanban Board (P1)

**Goal**: Display complete Kanban interface structure (título, totalizadores, 3 colunas)

**Priority**: P1 (MVP - Part 1)

**Independent Test**: Open app in browser → verify "TO-DO" title, three counters (all showing 0), and three empty columns labeled "To Do", "Doing", "Done"

**Duration**: ~1-2 hours

### Tasks

- [ ] T027 [US1] Create KanbanBoard component in src/components/KanbanBoard.tsx (main container, uses useTasks hook)
- [ ] T028 [P] [US1] Create TaskCounters component in src/components/TaskCounters.tsx (displays 3 counters for each status)
- [ ] T029 [P] [US1] Create KanbanColumn component in src/components/KanbanColumn.tsx (reusable column with title and children)
- [ ] T030 [US1] Update src/App.tsx to render KanbanBoard component with "TO-DO" title
- [ ] T031 [US1] Style KanbanBoard layout with Tailwind (flex, gap, responsive)
- [ ] T032 [US1] Style TaskCounters component (horizontal layout, styled badges for each counter)
- [ ] T033 [US1] Style KanbanColumn component (border, padding, min-height, flex column)

**Acceptance Criteria** (from spec.md):

- ✅ Title "TO-DO" visible at top
- ✅ Three counters showing "To Do: 0", "Doing: 0", "Done: 0"
- ✅ Three columns side-by-side labeled "To Do", "Doing", "Done"
- ✅ All columns empty

---

## Phase 4: User Story 2 - Create New Task (P1)

**Goal**: Enable task creation with título and descrição, display in "To Do" column

**Priority**: P1 (MVP - Part 2)

**Independent Test**: Click create button → fill form (título + descrição) → submit → verify task appears in "To Do" with yellow background and counter increments to 1

**Duration**: ~2-3 hours

**Dependencies**: Requires Phase 3 (US1) complete for visual structure

### Tasks

- [ ] T034 [US2] Create TaskCard component in src/components/TaskCard.tsx (displays task title, description, and action buttons)
- [ ] T035 [US2] Style TaskCard with status-based colors (todo-bg for 'todo', doing-bg/done-bg for 'doing'/'done')
- [ ] T036 [US2] Create TaskForm component in src/components/TaskForm.tsx (controlled form with title and description inputs)
- [ ] T037 [US2] Implement form validation in TaskForm (title and description required, show error messages)
- [ ] T038 [US2] Create "Add Task" button in KanbanBoard component (opens TaskForm dialog)
- [ ] T039 [US2] Integrate TaskForm with shadcn/ui Dialog component for modal display
- [ ] T040 [US2] Connect TaskForm submit to useTasks createTask function in KanbanBoard
- [ ] T041 [US2] Update KanbanColumn to render TaskCard components for tasks in that status
- [ ] T042 [US2] Update TaskCounters to display correct counts from useTasks state
- [ ] T043 [US2] Implement optimistic UI updates (add task to state immediately, rollback on error)

**Acceptance Criteria** (from spec.md):

- ✅ "Add Task" button visible and clickable
- ✅ Form opens with título and descrição fields
- ✅ Validation error if only título filled
- ✅ Validation error if only descrição filled
- ✅ Task appears in "To Do" column after submit
- ✅ Task card has yellow background (todo-bg color)
- ✅ "To Do" counter increments to 1
- ✅ Title and description clearly displayed on card

---

## Phase 5: User Story 6 - Persist Tasks Across Sessions (P2)

**Goal**: Automatically save tasks to IndexedDB and load on app start

**Priority**: P2 (Must have for real usage)

**Independent Test**: Create tasks → close browser → reopen → verify all tasks and counters persist exactly as left

**Duration**: ~30 min - 1 hour

**Dependencies**: Requires Phase 4 (US2) complete for task creation

**Note**: Placed before US3 because persistence is critical before adding more complex interactions

### Tasks

- [ ] T044 [US6] Update useTasks hook to load tasks from IndexedDB on mount (useEffect with getAllTasks)
- [ ] T045 [US6] Ensure createTask in useTasks persists to IndexedDB via db.createTask
- [ ] T046 [US6] Add error handling and loading states in useTasks (loading, error state management)
- [ ] T047 [US6] Display loading spinner in KanbanBoard while tasks are being loaded

**Acceptance Criteria** (from spec.md):

- ✅ Tasks created persist after browser close/reopen
- ✅ Tasks persist after page reload (F5)
- ✅ Tasks visible in new tab of same browser
- ✅ Offline task creation persists after reload

---

## Phase 6: User Story 3 - Move Task Between Statuses (P2)

**Goal**: Enable moving tasks between columns with button-based interaction

**Priority**: P2 (Core Kanban functionality)

**Independent Test**: Create task in "To Do" → click move button → verify task moves to "Doing", color changes to green, and counters update

**Duration**: ~2-3 hours

**Dependencies**: Requires Phase 4 (US2) for tasks and Phase 5 (US6) for persistence

### Tasks

- [ ] T048 [US3] Add "Move to Doing" and "Move to Done" buttons to TaskCard component (conditional rendering based on current status)
- [ ] T049 [US3] Add "Move to To Do" and "Move to Doing" buttons for backward movement (conditional rendering)
- [ ] T050 [US3] Connect move buttons to useTasks moveTask function in TaskCard
- [ ] T051 [US3] Update TaskCard color dynamically based on task.status (todo → yellow, doing/done → green)
- [ ] T052 [US3] Ensure counters update correctly after task movement (via useTasks state)
- [ ] T053 [US3] Implement optimistic UI updates for task movement (move in state immediately, rollback on error)
- [ ] T054 [US3] Update useTasks moveTask to persist changes to IndexedDB via db.moveTask

**Acceptance Criteria** (from spec.md):

- ✅ Task moves from "To Do" to "Doing" when button clicked
- ✅ Card color changes from yellow to green when moved to "Doing"
- ✅ "To Do" counter decrements, "Doing" counter increments
- ✅ Task moves from "Doing" to "Done"
- ✅ Card stays green in "Done" column
- ✅ Backward movement works (Done → Doing → To Do)
- ✅ Color reverts to yellow when moved back to "To Do"
- ✅ Counters always accurate with multiple tasks and movements

---

## Phase 7: User Story 4 - Edit Existing Task (P3)

**Goal**: Enable editing task título and descrição

**Priority**: P3 (Nice to have)

**Independent Test**: Click task → edit form appears → change título and descrição → save → verify changes displayed and persisted

**Duration**: ~1-2 hours

**Dependencies**: Requires Phase 4 (US2) for task display

### Tasks

- [ ] T055 [US4] Add "Edit" button to TaskCard component (icon or text button)
- [ ] T056 [US4] Create TaskEditForm component (similar to TaskForm but pre-filled with existing task data)
- [ ] T057 [US4] Implement form validation in TaskEditForm (title and description required, empty validation)
- [ ] T058 [US4] Integrate TaskEditForm with shadcn/ui Dialog component
- [ ] T059 [US4] Connect TaskEditForm submit to useTasks updateTask function
- [ ] T060 [US4] Add "Cancel" button to TaskEditForm (close dialog without saving)
- [ ] T061 [US4] Update useTasks updateTask to persist changes to IndexedDB via db.updateTask
- [ ] T062 [US4] Implement optimistic UI updates for task edit

**Acceptance Criteria** (from spec.md):

- ✅ Edit form opens with current title and description pre-filled
- ✅ Changes to title are saved and displayed
- ✅ Changes to description are saved and displayed
- ✅ Error shown when trying to save empty title
- ✅ Cancel button preserves original values

---

## Phase 8: User Story 5 - Delete Task (P3)

**Goal**: Enable task deletion with confirmation

**Priority**: P3 (Nice to have)

**Independent Test**: Click delete button → confirm dialog appears → confirm → verify task disappears and counter decrements

**Duration**: ~1 hour

**Dependencies**: Requires Phase 4 (US2) for task display

### Tasks

- [ ] T063 [US5] Add "Delete" button to TaskCard component (icon or text button, danger styling)
- [ ] T064 [US5] Create DeleteConfirmation component using shadcn/ui AlertDialog
- [ ] T065 [US5] Connect Delete button to open DeleteConfirmation dialog
- [ ] T066 [US5] Connect DeleteConfirmation "Confirm" button to useTasks deleteTask function
- [ ] T067 [US5] Update counters correctly after task deletion (via useTasks state)
- [ ] T068 [US5] Update useTasks deleteTask to persist deletion to IndexedDB via db.deleteTask
- [ ] T069 [US5] Implement optimistic UI updates for task deletion

**Acceptance Criteria** (from spec.md):

- ✅ Delete confirmation dialog appears when delete clicked
- ✅ Task disappears after confirmation
- ✅ Counter for that column decrements by 1
- ✅ Task remains if user cancels deletion

---

## Phase 9: Polish & Cross-Cutting Concerns

**Goal**: Final touches, error handling, accessibility, performance

**Duration**: ~1-2 hours

### Tasks

- [ ] T070 [P] Add error toast/notification component for IndexedDB operation failures
- [ ] T071 [P] Implement proper loading states for all async operations (create, move, edit, delete)
- [ ] T072 [P] Add keyboard navigation support (Tab, Enter, Escape)
- [ ] T073 [P] Ensure proper ARIA labels for all interactive elements
- [ ] T074 [P] Add empty state messaging in columns when no tasks exist
- [ ] T075 [P] Implement responsive design for tablets (min-width: 768px)
- [ ] T076 [P] Add hover states and transitions for interactive elements
- [ ] T077 [P] Test with 100+ tasks and optimize rendering if needed (consider virtualization)
- [ ] T078 Run production build and verify bundle size < 500KB gzipped

**Verification**: Run full manual test suite, accessibility audit (Lighthouse), performance test with many tasks, build size check.

---

## Dependencies & Execution Order

### Critical Path (Must Complete In Order)

```text
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US6) → Phase 6 (US3)
                                                                                                    ↓
                                                                         Phase 9 (Polish) ← Phase 8 (US5)
                                                                                                    ↑
                                                                                            Phase 7 (US4)
```

### Story Dependencies

- **US1**: No dependencies (first to implement)
- **US2**: Depends on US1 (needs visual structure)
- **US6**: Depends on US2 (needs task creation to test persistence)
- **US3**: Depends on US2 + US6 (needs tasks to move, persistence to save movements)
- **US4**: Depends on US2 (needs tasks to edit) - Can be done in parallel with US5
- **US5**: Depends on US2 (needs tasks to delete) - Can be done in parallel with US4

### Parallel Execution Opportunities

Within each phase, tasks marked `[P]` can be executed in parallel:

**Phase 1 (Setup)**: T002-T005, T008-T009, T011 can run in parallel after T001 completes

**Phase 2 (Foundational)**: T021-T025 can run in parallel after T020 completes

**Phase 3 (US1)**: T028-T029 can run in parallel with T027-T030

**Phase 4 (US2)**: T034-T035 can run while T036-T039 are in progress

**Phase 7 (US4) and Phase 8 (US5)**: Can be implemented in parallel (different files, independent features)

**Phase 9 (Polish)**: All tasks (T070-T078) can run in parallel

---

## Testing Strategy

### Manual Testing Checklist

After completing each user story phase:

**US1 Verification**:

- [ ] Title "TO-DO" visible
- [ ] Three counters showing 0
- [ ] Three empty columns displayed

**US2 Verification**:

- [ ] Create button works
- [ ] Form validation works (empty checks)
- [ ] Task appears in "To Do" column
- [ ] Card has yellow background
- [ ] Counter increments

**US6 Verification**:

- [ ] Close and reopen browser → tasks persist
- [ ] Reload page → tasks persist
- [ ] Open new tab → tasks visible

**US3 Verification**:

- [ ] Move buttons appear on cards
- [ ] Tasks move between columns
- [ ] Colors change correctly
- [ ] Counters update accurately

**US4 Verification**:

- [ ] Edit button works
- [ ] Form pre-fills with current data
- [ ] Changes save and display
- [ ] Validation works

**US5 Verification**:

- [ ] Delete button works
- [ ] Confirmation dialog appears
- [ ] Task disappears after confirm
- [ ] Cancel preserves task

### Automated Testing (Optional)

If implementing automated tests (not included in task count):

- Unit tests for `src/lib/db.ts` functions
- Unit tests for validation logic
- Component tests for TaskCard, TaskForm, etc.
- Integration tests for full user flows (create → move → edit → delete)

---

## Suggested MVP Scope

**Minimum Viable Product**: Phase 1 + Phase 2 + Phase 3 (US1) + Phase 4 (US2)

This delivers:

- ✅ Visual Kanban board structure
- ✅ Task creation with validation
- ✅ Tasks displayed in "To Do" column
- ✅ Counter updates
- ✅ Modern, clean UI

**Time Estimate**: ~5-7 hours

**Next Iteration**: Add Phase 5 (US6 - Persistence) → ~1 hour → Makes app usable long-term

**Full Feature Set**: All phases → ~12-15 hours total

---

## Task Count Summary

| Phase | User Story | Priority | Task Count | Duration |
|-------|-----------|----------|------------|----------|
| Phase 1 | Setup | N/A | 15 | 30 min |
| Phase 2 | Foundational | N/A | 11 | 1-2 hrs |
| Phase 3 | US1 - Empty Board | P1 | 7 | 1-2 hrs |
| Phase 4 | US2 - Create Task | P1 | 10 | 2-3 hrs |
| Phase 5 | US6 - Persistence | P2 | 4 | 30 min - 1 hr |
| Phase 6 | US3 - Move Tasks | P2 | 7 | 2-3 hrs |
| Phase 7 | US4 - Edit Task | P3 | 8 | 1-2 hrs |
| Phase 8 | US5 - Delete Task | P3 | 7 | 1 hr |
| Phase 9 | Polish | N/A | 9 | 1-2 hrs |
| **TOTAL** | | | **78** | **12-18 hrs** |

---

## Parallel Execution Examples

### Example 1: MVP Development (2 developers)

**Developer A**:

- T001-T015 (Setup)
- T016-T026 (Foundational)
- T027, T030-T031 (KanbanBoard + App.tsx)

**Developer B** (after T026 completes):

- T028-T029, T032-T033 (TaskCounters + KanbanColumn)
- T034-T035 (TaskCard)

Then both work on Phase 4 (US2) tasks in parallel.

### Example 2: Full Feature (3 developers)

**Developer A**: Phases 1-4 (MVP)

**Developer B**: Phase 5-6 (Persistence + Move)

**Developer C**: Phases 7-8 (Edit + Delete)

All three: Phase 9 (Polish) in parallel

---

## Format Validation

✅ **All tasks follow checklist format**:

- ✅ Checkbox prefix (`- [ ]`)
- ✅ Sequential Task IDs (T001-T078)
- ✅ `[P]` marker for parallelizable tasks
- ✅ `[US#]` label for user story phase tasks
- ✅ Clear descriptions with file paths
- ✅ No missing IDs or story labels

---

## Next Steps

1. **Start with Phase 1**: Follow [quickstart.md](./quickstart.md) for detailed setup instructions
2. **Complete MVP**: Finish Phases 1-4 for immediate usable product
3. **Iterate**: Add Phase 5 (Persistence), then Phase 6 (Movement)
4. **Polish**: Complete Phases 7-9 for full feature set

**Suggested Command**: Start development with `npm run dev` after completing Phase 1

---

## References

- **Specification**: [spec.md](./spec.md) - User stories and requirements
- **Plan**: [plan.md](./plan.md) - Architecture and tech stack
- **Data Model**: [data-model.md](./data-model.md) - TypeScript interfaces and schemas
- **Research**: [research.md](./research.md) - Technology decisions
- **Quickstart**: [quickstart.md](./quickstart.md) - Setup instructions
- **Contracts**: [contracts/indexeddb-schema.json](./contracts/indexeddb-schema.json) - Database schema
