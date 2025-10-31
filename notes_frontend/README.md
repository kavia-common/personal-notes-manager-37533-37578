# Ocean Notes - React + Supabase

A modern notes app with a clean Ocean Professional theme. Create, edit, and delete personal notes stored in Supabase.

## Quick Start

1) Install dependencies
   npm install

2) Environment variables
   Create a .env file in notes_frontend with:
   REACT_APP_SUPABASE_URL=<your_supabase_project_url>
   REACT_APP_SUPABASE_KEY=<your_supabase_anon_key>

3) Start the app
   npm start

The app will be available at http://localhost:3000

## Supabase schema

Create a table notes with the following columns:
- id: bigint (or uuid) - Primary key (if bigint, enable identity/auto increment)
- title: text
- content: text
- created_at: timestamp with time zone, default now()
- updated_at: timestamp with time zone, default now()

Example SQL:
  create table if not exists public.notes (
    id bigserial primary key,
    title text,
    content text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );

You may add Row Level Security policies as needed for your environment. For local prototyping you can temporarily disable RLS.

## Available scripts

- npm start - start development server
- npm test  - run tests in CI mode
- npm run build - production build

## Env reference

Used by the frontend:
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY

Other envs are scaffolded by the platform and are not required for this app to run.

## Notes

- This project uses @supabase/supabase-js v2.
- If you later add auth, wire it in src/components/AuthGate.jsx and pass a session to notesService calls as needed.
