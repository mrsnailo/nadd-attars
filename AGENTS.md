<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:database-conventions -->
# Database & Prisma Migration Workflow

**CRITICAL:** This project uses a strict, production-ready schema migration workflow. DO NOT use `prisma db push` to modify the schema.

When modifying the database schema (`prisma/schema.prisma`), you **MUST**:
1. Make your changes to `schema.prisma`.
2. Generate a new migration file locally by running: `npx prisma migrate dev --name <descriptive_name>` (Use a dockerized local postgres instance for `DATABASE_URL` if needed).
3. Commit both the updated `schema.prisma` and the newly generated SQL file in `prisma/migrations`.
4. Vercel will automatically apply the migration upon deployment via `prisma migrate deploy` in the build script.
<!-- END:database-conventions -->
