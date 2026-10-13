# Worklog App

A work tracking app for recording daily work against projects and clients. It is built with Next.js, uses GitHub sign-in, and stores data in PostgreSQL through Neon and Drizzle ORM.

## Features

- Create and manage clients and projects.
- Record daily entries with a work date, project, title, description, and optional client associations.
- Filter entries by date range.
- Move entries, projects, and clients to trash, with controls to restore or permanently delete entries.
- Sign in with GitHub. Google authentication is not currently enabled on the sign-in page.

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

Create `.env.local` in the project root. These values are required:

```dotenv
DATABASE_URL="postgresql://..."
AUTH_SECRET="generate-a-random-secret"
AUTH_GITHUB_ID="your-github-oauth-client-id"
AUTH_GITHUB_SECRET="your-github-oauth-client-secret"
```

`DATABASE_URL` is the PostgreSQL connection URL for your Neon database. `AUTH_SECRET` is used by Auth.js to sign and encrypt authentication data; generate one with `pnpm exec auth secret` or another secure random value. The GitHub ID and secret come from a GitHub OAuth application. Set its authorization callback URL to `http://localhost:3000/api/auth/callback/github` for local development, and use the corresponding `/api/auth/callback/github` URL on your deployed domain.

Keep `.env.local` out of source control. The Next.js app reads environment variables from `.env.local`; the Drizzle migration tools and worklog backfill script also read `DATABASE_URL` from `.env.local` or `.env` when it is not set in the process environment.

For an existing database, before applying the next migration, set
`LEGACY_WORKLOG_OWNER_ID` to the `users.id` of the account that should own
existing clients, projects, and entries. The backfill script reads
`DATABASE_URL` and `LEGACY_WORKLOG_OWNER_ID` from the process environment or
`.env.local`, verifies the owner exists, and assigns unowned records in a single
transaction. Back up the database before running it.

```bash
pnpm db:backfill-worklog
pnpm db:migrate
```

For a new database, skip the backfill and apply the checked-in migrations:

```bash
pnpm db:migrate
```

Then start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The home route redirects to the daily entries page.

## Scripts

Generate a migration after changing the Drizzle schema by providing a descriptive name:

```bash
pnpm db:generate -- --name add_entry_notes
```

Review the generated SQL migration, then apply it to the configured database with `pnpm db:migrate`.

| Command                    | Description                                                |
| -------------------------- | ---------------------------------------------------------- |
| `pnpm dev`                 | Start the local development server.                        |
| `pnpm build`               | Create a production build.                                 |
| `pnpm start`               | Serve the production build.                                |
| `pnpm lint`                | Run ESLint.                                                |
| `pnpm db:generate`         | Generate a named Drizzle migration from schema changes.    |
| `pnpm db:migrate`          | Apply pending Drizzle migrations.                          |
| `pnpm db:backfill-worklog` | Assign existing unowned records to the configured account. |

## Tech Stack

- [Next.js 16](https://nextjs.org/docs)
- [React 19](https://react.dev/)
- [Material UI](https://mui.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Neon](https://neon.tech/)
- [Auth.js](https://authjs.dev/)
