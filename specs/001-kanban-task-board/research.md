# Technology Research: Kanban Task Board

**Feature**: 001-kanban-task-board
**Date**: 2025-11-24
**Purpose**: Resolve technology choices and establish technical foundation

## Research Summary

This document consolidates research findings for all critical technology decisions required to implement the Kanban Task Board application. Each decision is evaluated against the Constitutional principles (Security-First, Performance, Resiliência, Simplicidade, Requisitos Tecnológicos) and project constraints (offline-capable, no backend, bundle size < 500KB).

## Decision 1: TypeScript vs JavaScript

### Context

Constitution VI.6 states: "TypeScript: Fortemente recomendado para type safety (exceto em casos justificados)". Para um projeto pequeno (~10 componentes, interface simples), precisamos avaliar o trade-off entre type safety e complexidade.

### Options Evaluated

**Option A: TypeScript**

- **Pros**:
  - Type safety catches errors at compile-time
  - Better IDE support (autocomplete, refactoring)
  - Self-documenting code through types
  - Easier to extend in future (colors, labels features)
  - Aligns with Constitutional recommendation

- **Cons**:
  - Additional build step configuration
  - Slightly more verbose code
  - Learning curve for team unfamiliar with TS

**Option B: JavaScript with JSDoc**

- **Pros**:
  - Zero configuration overhead
  - Faster initial development
  - Still provides some type checking via JSDoc comments
  - Simpler for small projects

- **Cons**:
  - Less robust type checking
  - Refactoring is riskier
  - No compile-time guarantees

### Decision: TypeScript

**Rationale**:

1. **Type Safety Critical for IndexedDB**: IndexedDB operations are async and complex - TypeScript prevents common errors with Promise handling and data structure mismatches
2. **shadcn/ui Native Support**: shadcn/ui components are TypeScript-native, providing better integration
3. **Future Extensibility**: Spec mentions future features (colors, labels) - TypeScript makes schema evolution safer
4. **Minimal Overhead**: Vite has zero-config TypeScript support, negating setup complexity
5. **Constitutional Alignment**: Follows strong recommendation without justified exception

**Configuration**:

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "bundler",
    "skipLibCheck": true
  }
}
```

## Decision 2: IndexedDB Wrapper Library

### Context

IndexedDB native API is callback-based and verbose. Need to choose between wrappers that provide Promise-based APIs while minimizing bundle size.

### Options Evaluated

**Option A: idb (Jake Archibald's library)**

- **Bundle Size**: ~1.5KB gzipped
- **API**: Promise-based, close to native IndexedDB
- **Pros**:
  - Minimal abstraction over native API
  - Tiny bundle size
  - Well-maintained by Google Chrome team
  - Excellent TypeScript support

- **Cons**:
  - More verbose than feature-rich alternatives
  - No built-in schema migration helpers
  - Requires more manual code for common patterns

**Option B: Dexie.js**

- **Bundle Size**: ~17KB gzipped
- **API**: High-level ORM-like interface
- **Pros**:
  - Feature-rich with built-in migrations
  - Query syntax similar to SQL
  - Excellent documentation
  - Production-proven

- **Cons**:
  - 11x larger than idb (34% of 500KB budget)
  - Over-engineered for simple key-value storage needs
  - Learning curve for API abstractions

**Option C: Native IndexedDB**

- **Bundle Size**: 0KB (browser native)
- **Pros**:
  - Zero dependency
  - Maximum performance
  - Full control

- **Cons**:
  - Callback-based API (error-prone)
  - Significant boilerplate code
  - Violates YAGNI (will reinvent Promise wrappers)

### Decision: idb

**Rationale**:

1. **Bundle Size**: 1.5KB is negligible (0.3% of budget) vs Dexie's 17KB (3.4%)
2. **Simplicity Principle**: Our data model is simple (single Tasks store) - don't need ORM complexity
3. **Type Safety**: Excellent TS support prevents IndexedDB API misuse
4. **Constitution Compliance**:
   - Performance: Minimal overhead
   - Dependencies Mínimas: Smallest viable wrapper
   - YAGNI: Only what we need, nothing more

**Implementation Pattern**:

```typescript
// lib/db.ts structure
import { openDB, IDBPDatabase } from 'idb';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'done';
  createdAt: number;
}

const DB_NAME = 'kanban-board';
const DB_VERSION = 1;

export async function initDB() {
  return openDB<{tasks: Task}>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore('tasks', { keyPath: 'id' });
    },
  });
}
```

## Decision 3: State Management

### Context

Need to determine if app requires state management library beyond React's built-in hooks (useState, useReducer, useContext).

### Options Evaluated

**Option A: Plain React Hooks (useState + useContext)**

- **Bundle Size**: 0KB (React built-in)
- **Pros**:
  - Zero dependencies
  - Simple, idiomatic React
  - Sufficient for component-level state
  - Easy to understand

- **Cons**:
  - Context re-renders can be inefficient at scale
  - No dev tools
  - Prop drilling if context not used

**Option B: Zustand**

- **Bundle Size**: ~1.5KB gzipped
- **Pros**:
  - Tiny, performant
  - Simple API
  - Good dev tools
  - Prevents unnecessary re-renders

- **Cons**:
  - Additional dependency
  - Overkill for simple state

**Option C: Redux Toolkit**

- **Bundle Size**: ~15KB gzipped
- **Pros**:
  - Industry standard
  - Excellent dev tools
  - Predictable state updates

- **Cons**:
  - Massive overkill for this app
  - Violates YAGNI and Dependencies Mínimas

### Decision: Plain React Hooks (useState + Custom Hook)

**Rationale**:

1. **YAGNI Principle**: State requirements are simple:
   - Task list (managed by IndexedDB)
   - UI state (modals, form inputs) - component-local
   - No complex state sharing across distant components

2. **Performance Adequate**: With proper component structure, re-renders are not a concern for ~100 tasks

3. **Zero Dependencies**: Aligns with "Dependencies Mínimas" principle

4. **Architecture**:
   - Custom `useTasks()` hook encapsulates IndexedDB operations
   - Component-local state for UI (modals, forms)
   - No need for global state management

**Implementation Pattern**:

```typescript
// hooks/useTasks.ts
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks().then(setTasks).finally(() => setLoading(false));
  }, []);

  const createTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask = { ...task, id: generateId(), createdAt: Date.now() };
    await saveTask(newTask);
    setTasks(prev => [newTask, ...prev]);
  };

  // ... other operations

  return { tasks, loading, createTask, updateTask, deleteTask, moveTask };
}
```

## Decision 4: Drag & Drop Implementation

### Context

Spec allows for either drag-and-drop OR button-based task movement. Need to balance UX richness with accessibility, bundle size, and implementation complexity.

### Options Evaluated

**Option A: @hello-pangea/dnd (react-beautiful-dnd fork)**

- **Bundle Size**: ~35KB gzipped
- **Pros**:
  - Beautiful animations
  - Excellent accessibility (keyboard navigation)
  - Touch device support
  - Production-proven

- **Cons**:
  - 7% of bundle budget
  - Complex API
  - Overkill for simple 3-column board

**Option B: dnd-kit**

- **Bundle Size**: ~15KB gzipped (core only)
- **Pros**:
  - Modern, modular architecture
  - Good performance
  - TypeScript-first
  - Accessible

- **Cons**:
  - 3% of bundle budget
  - Still complex for simple use case

**Option C: Native HTML5 Drag & Drop**

- **Bundle Size**: 0KB
- **Pros**:
  - Zero dependencies
  - Browser native

- **Cons**:
  - Poor touch device support
  - Accessibility challenges
  - Inconsistent browser behaviors
  - More code to handle edge cases

**Option D: Button-based Movement**

- **Bundle Size**: 0KB
- **Pros**:
  - Perfect accessibility (keyboard, screen readers)
  - Works on all devices
  - Simpler implementation
  - Clearer UX for status changes

- **Cons**:
  - Less "modern" feeling
  - No drag satisfaction

### Decision: Button-based Movement (Phase 1) + Optional Drag & Drop (Phase 2)

**Rationale**:

1. **MVP First**: Spec allows either method - button-based delivers full functionality faster
2. **Accessibility Priority**: Buttons provide superior accessibility out-of-box
3. **Bundle Size**: Saves 15-35KB (3-7% of budget)
4. **YAGNI**: Implement simplest solution first, add D&D if user feedback demands it
5. **Constitution Alignment**:
   - Simplicidade: Buttons are simpler
   - Dependencies Mínimas: Zero dependencies
   - Acessibilidade: Keyboard/screen reader friendly by default

**Implementation**:

- Each TaskCard has "→" and "←" buttons to move between columns
- Buttons disabled appropriately (e.g., no "←" in To Do column)
- Clear labeling for accessibility ("Move to Doing", etc.)
- Optional: Add drag & drop in future iteration if needed

## Decision 5: Schema Versioning Strategy

### Context

Need IndexedDB migration strategy to support future features (colors, labels) without breaking existing user data.

### Options Evaluated

**Option A: Version-based Migrations (idb native)**

- **Approach**: Use IndexedDB version numbers with upgrade handlers

```typescript
const DB_VERSION = 1; // increment when schema changes

openDB(DB_NAME, DB_VERSION, {
  upgrade(db, oldVersion, newVersion) {
    if (oldVersion < 1) {
      db.createObjectStore('tasks', { keyPath: 'id' });
    }
    // Future: if (oldVersion < 2) { add color field }
  },
});
```

**Option B: Application-level Migration Scripts**

- **Approach**: Store schema version in separate store, run migrations manually

### Decision: Version-based Migrations (idb native)

**Rationale**:

1. **Built-in Feature**: IndexedDB provides version handling - YAGNI says use it
2. **Atomic Updates**: Browser ensures migrations are atomic
3. **Standard Pattern**: Well-documented best practice
4. **Forward Compatible**: Schema designed with extensibility:

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: number;
  // Future fields:
  // color?: string;  // v2
  // labels?: string[];  // v3
}
```

**Migration Plan**:

- V1 (current): Basic task structure
- V2 (future): Add optional `color` field, default to status-based color
- V3 (future): Add optional `labels` array field, default to empty
- All new fields optional to preserve backward compatibility

## Decision 6: Testing Strategy

### Context

Need testing setup that integrates with Vite, handles IndexedDB mocking, and works with shadcn/ui components.

### Options Evaluated

**Option A: Vitest + React Testing Library**

- **Pros**:
  - Native Vite integration (zero config)
  - Fast (powered by Vite)
  - Jest-compatible API
  - Excellent React Testing Library support

- **Cons**:
  - None significant for this use case

**Option B: Jest + React Testing Library**

- **Pros**:
  - Industry standard
  - More plugins/resources

- **Cons**:
  - Requires complex configuration with Vite
  - Slower than Vitest
  - Redundant with Vite's dev server

### Decision: Vitest + React Testing Library

**Rationale**:

1. **Vite Native**: Zero configuration, leverages existing Vite setup
2. **Performance**: Faster test execution than Jest
3. **Constitution**: Build Determinístico - consistent test environment
4. **IndexedDB Mocking**: Use fake-indexeddb package

**Test Structure**:

```text
tests/
├── unit/
│   ├── db.test.ts              # IndexedDB operations
│   └── components.test.tsx      # Component unit tests
└── integration/
    └── kanban-flow.test.tsx     # End-to-end user flows
```

**IndexedDB Mocking**:

```typescript
// vitest.setup.ts
import 'fake-indexeddb/auto';
```

## Technology Stack Summary

### Core Stack (Approved)

| Component | Technology | Bundle Size | Rationale |
|-----------|-----------|-------------|-----------|
| Language | TypeScript | 0KB (compile-time) | Type safety, Constitutional recommendation |
| Framework | React 18 | ~42KB | Constitutional requirement, modern hooks |
| Build Tool | Vite | 0KB (dev-time) | Constitutional requirement, fast builds |
| Styling | Tailwind CSS 3 | ~10KB (purged) | Constitutional requirement, utility-first |
| UI Components | shadcn/ui | ~5KB/component | Constitutional requirement, accessible |
| Storage | IndexedDB (idb wrapper) | ~1.5KB | Browser-native + minimal wrapper |
| State | React Hooks | 0KB | Built-in, sufficient for needs |
| Task Movement | Buttons | 0KB | Accessible, simple, YAGNI |
| Testing | Vitest + RTL | 0KB (dev-time) | Vite-native, fast |

**Total Runtime Bundle**: ~60-80KB gzipped (12-16% of 500KB budget)

### Development Tools

- **Linting**: ESLint (Constitutional requirement)
- **Formatting**: Prettier (Constitutional requirement)
- **Package Manager**: npm or pnpm (Constitutional requirement)
- **Node Version**: 18+ LTS (Constitutional requirement)

## Best Practices & Patterns

### IndexedDB Patterns

1. **Retry Logic** (Constitution III.2):

```typescript
async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await delay(1000);
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
}
```

2. **Timeout Configuration** (Constitution III.4):

```typescript
async function withTimeout<T>(promise: Promise<T>, ms = 5000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timeout')), ms)
    ),
  ]);
}
```

### Performance Patterns

1. **Lazy Loading** (Constitution II.2):

```typescript
const TaskForm = lazy(() => import('./components/TaskForm'));
const DeleteConfirmation = lazy(() => import('./components/DeleteConfirmation'));
```

2. **Memoization** (avoid unnecessary re-renders):

```typescript
const TaskCard = memo(({ task, onMove, onEdit, onDelete }) => {
  // ... component logic
});
```

### Validation Patterns

1. **Input Validation** (Constitution I.3):

```typescript
function validateTask(task: Partial<Task>): string[] {
  const errors: string[] = [];
  if (!task.title?.trim()) errors.push('Título é obrigatório');
  if (!task.description?.trim()) errors.push('Descrição é obrigatória');
  return errors;
}
```

## CI/CD Recommendations

### Build & Deploy

1. **GitHub Actions Workflow** (optional, not implemented in MVP):

```yaml
name: Build and Deploy
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

2. **Static Hosting Options**:
   - GitHub Pages (free, simple)
   - Vercel (free tier, zero config)
   - Netlify (free tier, zero config)

### Bundle Size Monitoring

1. **Vite Bundle Analyzer**:

```bash
npm install --save-dev rollup-plugin-visualizer
```

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [react(), visualizer()],
});
```

## Open Questions Resolved

✅ Q1: TypeScript ou JavaScript puro? → **TypeScript**

✅ Q2: Qual wrapper IndexedDB usar? → **idb (Jake Archibald)**

✅ Q3: State management necessário além de hooks básicos? → **No, React Hooks sufficient**

✅ Q4: Biblioteca drag-and-drop ou implementação nativa? → **Button-based movement (simpler, accessible)**

✅ Q5: Estratégia de versionamento de schema IndexedDB? → **Version-based migrations (idb native)**

✅ Q6: Configuração de CI/CD para build estático? → **Optional (GitHub Actions + Pages recommended)**

## Next Phase: Data Model & Contracts

With all technology decisions finalized, proceed to Phase 1:

1. Generate `data-model.md` with detailed Task schema
2. Create `contracts/indexeddb-schema.json` documenting database structure
3. Generate `quickstart.md` with setup instructions
4. Update agent context with approved tech stack

## References

- [idb Documentation](https://github.com/jakearchibald/idb)
- [IndexedDB Best Practices](https://web.dev/indexeddb-best-practices/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Vitest Documentation](https://vitest.dev/)
