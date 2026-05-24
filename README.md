# CSU OJT Management System

**Caraga State University** On-the-Job Training platform — built with React, TypeScript, Vite, and Tailwind CSS.

**Lead Developer:** Raminder Jangao

## Features

- Role-based dashboards (Admin, Coordinator, Supervisor, Student)
- OJT applications, daily logs, requirements (PDF/photo upload)
- Evaluations, attendance reports, announcements, and analytics charts
- Modern UI with profile photos (localStorage)

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## AI Assistant (floating chatbot)

Logged-in users (admin, coordinator, supervisor, student) see a floating **CSU OJT Assistant** button. The API key stays on the server — never in the frontend bundle.

**Local setup:** copy `.env.example` to `.env` and set:

```env
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=google/gemini-2.0-flash-001
```

**Vercel:** add the same variables under Project → Settings → Environment Variables (`OPENROUTER_API_KEY`, optional `OPENROUTER_MODEL`).

## Deploy to Vercel

This repo includes [`vercel.json`](./vercel.json) configured for a Vite SPA + `/api/chat` serverless route:

1. Push the project to GitHub (or GitLab / Bitbucket).
2. Import the repository at [vercel.com/new](https://vercel.com/new).
3. Vercel auto-detects **Vite** — confirm:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variables (see AI Assistant above).
5. Click **Deploy**.

Client-side routing is handled via rewrites to `index.html`. `/api/*` routes hit serverless functions. Static assets are cached under `/assets/`.

> **Note:** Data is stored in the browser (`localStorage`). Each visitor has their own demo dataset after seeding on first load.

## Demo accounts

| Role        | Email                 | Password   |
|-------------|-----------------------|------------|
| Admin       | admin@gmail.com       | admin123   |
| Coordinator | coordinator@gmail.com | coord123   |
| Supervisor  | supervisor@gmail.com    | super123   |
| Student     | student@gmail.com     | student123 |

## License

Academic / project use — Caraga State University OJT program.
