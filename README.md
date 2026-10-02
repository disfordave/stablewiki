# 🔭 StableWiki Engine

![StableWiki Engine Mockup (SidWiki)](docs/images/stablewiki-sidwiki-mockup.jpg)

[![CI](https://github.com/disfordave/stablewiki/actions/workflows/ci.yml/badge.svg)](https://github.com/disfordave/stablewiki/actions/workflows/ci.yml)
![Licence](https://img.shields.io/badge/Licence-AGPL--3.0--or--later-blue)

🌐 **Live Demo:** [https://wiki.hsw.is](https://wiki.hsw.is)

StableWiki Engine is an open-source wiki and knowledge platform built with **Next.js, TypeScript, and PostgreSQL**.

It was originally created to replace the friction of maintaining a **Git-based Markdown blog**.
Instead of writing posts locally and pushing commits, StableWiki allows pages to be created and edited directly on the web while preserving the structure and traceability of a wiki.

The engine powers **[SidWiki](https://wiki.hsw.is)** — the ultimate knowledge base and blog platform that combines:

- wiki-style articles
- personal blog pages through user subpages
- lightweight community discussions via `_lounge`
- revision history and link-driven navigation

StableWiki aims to be simple, transparent, and accessible, prioritizing **Markdown editing and server-rendered content** so that the platform remains usable even without JavaScript.

---

# Core Concepts

StableWiki is built around several core ideas.

### Wiki + Blog Hybrid

StableWiki treats user pages and their subpages as blog posts while keeping regular pages as wiki articles.

Example structure:

```
User:eric
User:eric/How_to_vote_in_Quebec
JavaScript
Category:Programming
```

This allows the same system to support both:

- structured knowledge articles
- personal publishing

---

### Link-Driven Knowledge Graph

Pages are connected using wiki links.

```
[[JavaScript]]
[[Category:Member of UN]]
```

These links automatically generate:

- backlinks
- category pages

---

### Markdown-First Editing

StableWiki uses **Markdown as the primary content format**.

Pages can be edited using a simple textarea editor, ensuring that writing remains accessible even in environments where JavaScript is unavailable.

JavaScript enhancements such as search autocomplete or preview rendering are applied progressively.

---

### Progressive Enhancement

StableWiki prioritizes **server-rendered content** and accessibility.

Core functionality works without JavaScript, while optional enhancements improve the editing experience in modern browsers.

---

# Features

- Wiki page system with namespace support
- Markdown-based article editing
- Page revision history with version rollback
- Trash: deleted pages can be restored by editors
- User authentication and role-based permissions
- Link-driven navigation with backlinks and categories
- Redirect support using wiki syntax
- Integrated discussion via `_lounge`
- Search functionality with autocomplete
- Responsive UI for mobile and desktop

---

# Installation

To install StableWiki Engine, follow these steps.

### 1. Clone the repository

```bash
git clone https://github.com/disfordave/stablewiki.git
```

### 2. Enter the project directory

```bash
cd stablewiki
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Rename `.env.example` to `.env` and update the values accordingly.

### 5. Set up the database

```bash
npx prisma migrate deploy
```

Run this again after every update; it applies any new migrations, including
data fixes that `prisma db push` would skip.

### 6. Start the development server

```bash
npm run dev
```

Then open:

```
http://localhost:3000
```

---

# Configuration

`.env` contains various configuration options for StableWiki.

## App Configuration

| Variable                 | Description                           |
| ------------------------ | ------------------------------------- |
| `NEXT_PUBLIC_BASE_URL`   | Base URL of your StableWiki instance  |
| `DATABASE_URL`           | PostgreSQL connection string          |
| `DATABASE_MAX_POOL_SLOT` | Maximum database connection pool size |
| `JWT_SECRET`             | Secret key used for authentication    |

---

## Wiki Information

| Variable                    | Description                    |
| --------------------------- | ------------------------------ |
| `WIKI_NAME`                 | Name of your wiki              |
| `WIKI_HOMEPAGE_LINK`        | Homepage page slug             |
| `WIKI_DESCRIPTION`          | Description shown for the wiki |
| `WIKI_COPYRIGHT_HOLDER`     | Copyright owner                |
| `WIKI_COPYRIGHT_HOLDER_URL` | URL for the copyright holder   |

---

## Feature Controls

| Variable                   | Description                |
| -------------------------- | -------------------------- |
| `WIKI_DISABLE_MEDIA`       | Disable media uploads      |
| `WIKI_MEDIA_ADMIN_ONLY`    | Restrict uploads to admins |
| `WIKI_DISABLE_SIGNUP`      | Disable user registration  |
| `WIKI_DISABLE_SYSTEM_LOGS` | Disable system logging     |

---

## Logo and Theme

| Variable            | Description            |
| ------------------- | ---------------------- |
| `WIKI_DISABLE_LOGO` | Hide the header logo   |
| `WIKI_ROUND_LOGO`   | Use rounded logo style |
| `WIKI_LOGO_URL`     | Custom logo image URL  |
| `WIKI_THEME_COLOR`  | Primary theme color    |

Available theme colors:

```
violet (default)
rose
emerald
orange
sky
indigo
yellow
pink
zinc
```

---

## Media Storage

| Variable               | Description                                                |
| ---------------------- | ---------------------------------------------------------- |
| `STORAGE_DRIVER`       | `local` (default) or `s3`                                  |
| `STORAGE_LOCAL_DIR`    | Folder for `local` storage (default `public/media`)        |
| `S3_BUCKET`            | Bucket name (required for `s3`)                            |
| `S3_REGION`            | Region (default `auto`, which suits Cloudflare R2)         |
| `S3_ENDPOINT`          | Endpoint for S3-compatible services such as R2 or MinIO    |
| `S3_ACCESS_KEY_ID`     | Access key (omit to use the AWS SDK's default credentials) |
| `S3_SECRET_ACCESS_KEY` | Secret key                                                 |
| `S3_FORCE_PATH_STYLE`  | `true` for MinIO and other path-style services             |
| `S3_KEY_PREFIX`        | Prefix for object keys (default `media/`)                  |

---

## Monitoring

| Variable                    | Description                                  |
| --------------------------- | -------------------------------------------- |
| `LOG_LEVEL`                 | `debug`, `info` (default), `warn` or `error` |
| `SENTRY_DSN`                | Sends server errors to Sentry when set       |
| `SENTRY_ENVIRONMENT`        | Environment name reported to Sentry          |
| `SENTRY_TRACES_SAMPLE_RATE` | Share of requests traced, 0 to 1 (default 0) |

In production, logs are written as one JSON object per line.

---

# Serverless Platform Notes

The default `local` media storage writes to the server's disk, which
serverless platforms don't keep. Use object storage instead:

```
STORAGE_DRIVER=s3
S3_BUCKET=your-bucket
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
```

Or disable media uploads entirely:

```
WIKI_DISABLE_MEDIA=true
```

---

# Edit Levels

Admins can raise a page's edit level from the dashboard:

| Level  | Who can edit                |
| ------ | --------------------------- |
| 0      | Any signed-in user          |
| 2      | Accounts older than 14 days |
| 1, 3–7 | Moderators and above        |
| 8      | Editors and above           |
| 9      | Admins only                 |

`Wiki:` pages and the homepage always require an editor, and `User:` pages
can only be edited by their owner (or an admin).

---

# Upgrading

1. Pull the new version and run `npm install`.
2. Apply new migrations with `npx prisma migrate deploy`.

If your database was created with `prisma db push`, Prisma doesn't know which
migrations it already has. Mark the existing ones as applied once, then deploy:

```bash
for m in $(ls prisma/migrations | grep -v migration_lock); do
  [ "$m" = "20261002120000_soft_delete_and_unique_revision_versions" ] && break
  npx prisma migrate resolve --applied "$m"
done
npx prisma migrate deploy
```

---

# Development

```bash
npm run dev               # development server
npm test                  # unit tests
npm run test:integration  # tests against a real, temporary PostgreSQL
```

The integration tests download and start their own PostgreSQL through
`embedded-postgres`, so no Docker or local database is needed. They never
touch the database in `.env`.

---

# Roadmap

Future plans and development notes are tracked in:

[https://wiki.hsw.is/wiki/User:dave/[Wiki]\_The_Future_of_SidWiki_and_StableWiki_Engine](https://wiki.hsw.is/wiki/User:dave/[Wiki]_The_Future_of_SidWiki_and_StableWiki_Engine)

---

# Contributing

Contributions are welcome.

Areas where contributions are particularly helpful:

- Serverless compatibility
- UI improvements
- documentation improvements

### Contribution workflow

1. Fork the repository
2. Create a branch

```
git checkout -b feature/your-feature-name
```

3. Commit your changes

```
git commit -m "Add some feature"
```

4. Push the branch

```
git push origin feature/your-feature-name
```

5. Open a pull request

---

# Built With

- **Next.js** — full-stack framework
- **TypeScript** — static typing
- **PostgreSQL** — relational database
- **Prisma ORM** — object-relational mapper
- **Tailwind CSS** — styling
- **TanStack Query** — data fetching (client)
- **Vitest** — unit testing

---

# License

This project is licensed under the **GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later)**.

In short:

- You may freely use and modify the project.
- If you deploy the project as a service, you must also share your modifications under the same license.

See the [LICENSE](LICENSE) file for details.

---

# StableWiki in Production

StableWiki Engine currently powers:

**SidWiki**

[https://wiki.hsw.is](https://wiki.hsw.is)

The ultimate knowledge base and blog platform built using the StableWiki engine created by the [same developer](https://wiki.hsw.is/wiki/User:disfordave).
