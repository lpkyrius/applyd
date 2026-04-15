# SECURITY.md: Next.js & SQLite Security Guardrails

## 1. Secrets & Local Database
- **Environment Variables**: Sensitive keys must never be prefixed with `NEXT_PUBLIC_`.
- **Database Security**: Since SQLite is a file (`.db`), the database file **must be added to .gitignore** to prevent sensitive application data from being committed to version control.

## 2. Data Protection
- **SQL Injection**: Prevented by using Prisma's parameterized queries.
- **CSRF**: Next.js Server Actions have built-in CSRF protection.
- **Validation**: Use **Zod** to validate all incoming data from forms before reaching the SQLite layer.

## 3. Authentication
- **Identity**: Implemented via **Auth.js (NextAuth)**. 
- **Session Management**: Use the Prisma Adapter for Auth.js to store sessions directly in the SQLite database.