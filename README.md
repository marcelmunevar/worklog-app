# Worklog App

A work tracking app for recording daily work against projects and clients. It is built with Next.js, uses GitHub sign-in, and stores data in PostgreSQL through Neon and Drizzle ORM.

## Features

- Create and manage clients and projects.
- Record daily entries with a work date, project, title, description, and optional client associations.
- Filter entries by date range.
- Soft-delete entries, projects, and clients, with controls to view deleted records.
- Sign in with GitHub.

## Requirements

- Node.js compatible with Next.js 16.
- pnpm.
- A PostgreSQL database. The app uses Neon’s serverless PostgreSQL driver.
- A GitHub OAuth application for sign-in.

## Setup

Install dependencies:

```bash
pnpm install
```

Create `.env.local` in the project root:

```dotenv
DATABASE_URL="postgresql://..."
AUTH_SECRET="generate-a-random-secret"
AUTH_GITHUB_ID="your-github-oauth-client-id"
AUTH_GITHUB_SECRET="your-github-oauth-client-secret"
```

Set the GitHub OAuth application's callback URL to `http://localhost:3000/api/auth/callback/github` for local development. Generate an Auth.js secret with `pnpm exec auth secret` or another secure random value. Keep `.env.local` out of source control.

Apply the checked-in database migrations, then start the development server:

```bash
pnpm db:migrate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The home route redirects to the daily entries page.

## Scripts

| Command            | Description                                       |
| ------------------ | ------------------------------------------------- |
| `pnpm dev`         | Start the local development server.               |
| `pnpm build`       | Create a production build.                        |
| `pnpm start`       | Serve the production build.                       |
| `pnpm lint`        | Run ESLint.                                       |
| `pnpm db:generate` | Generate a Drizzle migration from schema changes. |
| `pnpm db:migrate`  | Apply pending Drizzle migrations.                 |

## Tech Stack

- [Next.js 16](https://nextjs.org/docs)
- [React 19](https://react.dev/)
- [Material UI](https://mui.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Neon](https://neon.tech/)
- [Auth.js](https://authjs.dev/)
