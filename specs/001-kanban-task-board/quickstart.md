# Quickstart Guide: Kanban Task Board

**Feature**: 001-kanban-task-board
**Date**: 2025-11-24
**Audience**: Developers setting up the project for the first time

## Prerequisites

- **Node.js**: 18.x or higher (LTS recommended)
- **Package Manager**: npm 9+ or pnpm 8+
- **Browser**: Modern browser with IndexedDB support (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **IDE**: VS Code or similar with TypeScript support (recommended)

## Initial Setup

### 1. Create Vite + React + TypeScript Project

```bash
# Using npm
npm create vite@latest . -- --template react-ts

# OR using pnpm
pnpm create vite . --template react-ts
```

### 2. Install Core Dependencies

```bash
# Install React, Vite, TypeScript (if not already included)
npm install react react-dom
npm install -D @types/react @types/react-dom

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install IndexedDB wrapper
npm install idb

# Install shadcn/ui dependencies
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
```

### 3. Configure Tailwind CSS

**tailwind.config.js**:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Status-based colors (from spec)
        'todo-bg': '#FEF9C3',      // Yellow 100 (light yellow)
        'doing-bg': '#BBF7D0',     // Green 200 (light green)
        'done-bg': '#BBF7D0',      // Green 200 (light green)
      },
    },
  },
  plugins: [],
}
```

**src/index.css**:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Optional: Custom styles */
body {
  @apply bg-gray-50;
}
```

### 4. Initialize shadcn/ui

```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# When prompted, choose:
# - Style: Default
# - Base color: Slate (or your preference)
# - CSS variables: Yes
```

**components.json** (should be auto-generated):

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### 5. Install shadcn/ui Components

```bash
# Install required components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add alert-dialog
```

### 6. Configure TypeScript Path Aliases

**tsconfig.json**:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**vite.config.ts**:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

### 7. Setup Testing (Vitest + React Testing Library)

```bash
# Install testing dependencies
npm install -D vitest @vitest/ui
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event
npm install -D fake-indexeddb jsdom
```

**vitest.config.ts**:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

**src/test/setup.ts**:

```typescript
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import 'fake-indexeddb/auto'

expect.extend(matchers)

afterEach(() => {
  cleanup()
})
```

### 8. Setup Linting & Formatting

```bash
# Install ESLint and Prettier
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

**.eslintrc.cjs**:

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', 'prettier'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'prettier/prettier': 'error',
  },
}
```

**.prettierrc**:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

### 9. Update package.json Scripts

**package.json**:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\""
  }
}
```

## Project Structure

After setup, create this folder structure:

```bash
mkdir -p src/components/ui
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p src/test
```

Your structure should look like:

```text
/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── ui/              # shadcn/ui components (auto-generated)
│   ├── lib/
│   │   ├── db.ts           # IndexedDB operations (to be created)
│   │   ├── utils.ts        # Utilities (from shadcn/ui)
│   │   └── types.ts        # TypeScript types (to be created)
│   ├── hooks/
│   │   └── useTasks.ts     # Custom hook (to be created)
│   ├── test/
│   │   └── setup.ts        # Test setup (created above)
│   ├── App.tsx             # Main component (to be created)
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── .eslintrc.cjs
├── .prettierrc
├── components.json          # shadcn/ui config
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── tailwind.config.js
```

## Development Workflow

### Start Development Server

```bash
npm run dev
```

Access app at: `http://localhost:5173`

### Run Tests

```bash
# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui
```

### Lint & Format Code

```bash
# Check for linting errors
npm run lint

# Format code
npm run format
```

### Build for Production

```bash
npm run build
```

Output in `dist/` folder - ready for static hosting.

### Preview Production Build

```bash
npm run preview
```

## IndexedDB Development Tools

### Chrome DevTools

1. Open DevTools (F12)
2. Navigate to **Application** tab
3. Expand **IndexedDB** section
4. Find **kanban-board** database
5. View/edit **tasks** object store

### Firefox DevTools

1. Open DevTools (F12)
2. Navigate to **Storage** tab
3. Expand **Indexed DB** section
4. Find **kanban-board** database

### Debugging IndexedDB

**Enable Verbose Logging**:

```typescript
// In lib/db.ts during development
const DEBUG = import.meta.env.DEV;

export async function createTask(input: CreateTaskInput): Promise<Task> {
  if (DEBUG) console.log('[DB] Creating task:', input);
  // ... implementation
}
```

**Clear Database** (for testing):

```javascript
// Run in browser console
indexedDB.deleteDatabase('kanban-board');
location.reload();
```

## Environment Variables

Create **.env** file for environment-specific config:

```bash
# .env
VITE_APP_NAME=Kanban Task Board
VITE_DB_NAME=kanban-board
VITE_DB_VERSION=1
```

Access in code:

```typescript
const DB_NAME = import.meta.env.VITE_DB_NAME || 'kanban-board';
```

**Note**: Don't forget to add `.env` to `.gitignore`!

## Common Issues & Solutions

### Issue: Module path aliases not working

**Solution**: Ensure both `tsconfig.json` and `vite.config.ts` have matching path configurations. Restart TS server in IDE.

### Issue: shadcn/ui components not found

**Solution**: Check `components.json` aliases match `tsconfig.json` paths. Re-run `npx shadcn-ui@latest init` if needed.

### Issue: IndexedDB not working in tests

**Solution**: Ensure `fake-indexeddb` is imported in `test/setup.ts` **before** any test files.

### Issue: Tailwind classes not applying

**Solution**:
1. Check `content` paths in `tailwind.config.js` include all component files
2. Ensure `@tailwind` directives are in `src/index.css`
3. Restart dev server

### Issue: TypeScript errors with shadcn/ui

**Solution**: Install missing type definitions:

```bash
npm install -D @types/node
```

## Next Steps

With setup complete, you're ready to implement:

1. **lib/db.ts**: IndexedDB operations (see data-model.md)
2. **lib/types.ts**: TypeScript interfaces
3. **hooks/useTasks.ts**: Custom React hook for task management
4. **App.tsx**: Main Kanban board component
5. **components/**: Individual UI components (TaskCard, KanbanColumn, etc.)

Refer to:
- [data-model.md](./data-model.md) for data structures
- [contracts/indexeddb-schema.json](./contracts/indexeddb-schema.json) for database schema
- [plan.md](./plan.md) for architecture overview

## Deployment

### Static Hosting Options

After running `npm run build`, deploy the `dist/` folder to:

1. **GitHub Pages**:

```bash
npm install -D gh-pages

# Add to package.json scripts:
"deploy": "gh-pages -d dist"

# Deploy:
npm run deploy
```

2. **Vercel**:

```bash
npm install -g vercel
vercel
```

3. **Netlify**:

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

All options provide:
- HTTPS by default
- CDN distribution
- Zero-config deployment

## Support

- **Vite Documentation**: https://vitejs.dev/
- **React Documentation**: https://react.dev/
- **shadcn/ui Documentation**: https://ui.shadcn.com/
- **Tailwind CSS Documentation**: https://tailwindcss.com/
- **IndexedDB (idb) Documentation**: https://github.com/jakearchibald/idb
- **Vitest Documentation**: https://vitest.dev/

Happy coding! 🚀
