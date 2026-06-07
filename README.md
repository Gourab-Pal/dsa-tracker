# Track DSA

A full-featured DSA practice tracker built with React, Vite, and Supabase.

## Features

- Track DSA questions with topics, companies, difficulty, status
- Dashboard with analytics, charts, and activity heatmap
- Focus mode with solve timer
- Daily study plan based on weak areas
- Dark/light theme
- Import/export, share links, keyboard shortcuts
- Authentication with per-user data isolation

## Setup

1. `npm install`
2. Create a `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. `npm run dev`

## Deploy

Build with `npm run build`, deploy the `dist` folder to Vercel/Netlify.

Set the same environment variables in your hosting provider's settings.
