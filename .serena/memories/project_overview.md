# Tiny Notes - Project Overview

## Purpose
Minimalist task management app with three areas: Inbox, Week view, and Someday.
UI is in Russian language.

## Tech Stack
- **React 19** + **TypeScript 5.9**
- **Vite 7** — build tool and dev server
- **Supabase** — PostgreSQL cloud database (@supabase/supabase-js)
- **dnd-kit** — drag-and-drop (@dnd-kit/core, @dnd-kit/sortable)
- **date-fns** — date utilities with Russian locale
- **Tiptap** — WYSIWYG editor (@tiptap/react, @tiptap/starter-kit, @tiptap/extension-link, @tiptap/extension-underline)
- **react-day-picker** — calendar date picker
- **CSS Modules** — component styling

## Project Structure
```
src/
├── components/     # React components with CSS Modules (each component in own folder)
├── hooks/          # Custom React hooks (useTasks, useKeyboard)
├── lib/            # Supabase client configuration
├── styles/         # Global styles and theme
├── types/          # TypeScript interfaces (Task, TaskArea, TaskColor, DayData)
├── utils/          # Date utilities
├── App.tsx         # Main app component
└── main.tsx        # Entry point
```

## Key Architecture
- **Drag-and-Drop**: Uses dnd-kit with optimistic updates for instant UI response
- **Week View**: Lazy week loading, only loads current week initially
- **Persistence**: Supabase with optimistic updates and rollback on error
- **Sync Indicator**: Shows sync status (syncing/synced/error) in header

## Deployment
- **Docker**: Multi-stage build (node:20-alpine → nginx:alpine)
- **docker-compose.yml**: Exposes port 51973, auto-restart enabled
- **Build**: `docker-compose build && docker-compose up -d`
