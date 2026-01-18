# Code Style and Conventions

## General
- TypeScript with strict types
- ES Modules (type: "module" in package.json)
- ESLint with typescript-eslint, react-hooks, and react-refresh plugins

## React Components
- Functional components only
- Components organized in folders: `ComponentName/ComponentName.tsx` + `ComponentName.module.css`
- Props interfaces named as `ComponentNameProps`
- Use CSS Modules for styling (import as `styles`)

## TypeScript
- Use type literals for unions: `type TaskArea = 'inbox' | 'week' | 'someday'`
- Interfaces for object shapes
- Optional properties marked with `?`
- Types exported from `src/types/index.ts`

## Hooks
- Custom hooks in `src/hooks/`
- Hook names prefixed with `use`
- Main state management in `useTasks.ts` hook

## Naming Conventions
- camelCase for variables, functions, hooks
- PascalCase for components, interfaces, types
- kebab-case for CSS classes
- Constants in component scope (not UPPER_CASE)

## Styling
- Dark theme inspired by Anthropic/Claude
- Background: #1a1a1a
- Cards colored by priority (orange, terracotta, gray-blue, green, lavender)
- Today highlight: #D97706 (orange)

## Localization
- UI is in Russian
- Day names: "пн", "вт", "ср", "чт", "пт", "сб", "вс"
- Date format: "16 января 2026"
