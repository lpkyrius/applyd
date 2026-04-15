# CODING_GUIDELINES.md: TypeScript & Next.js Standards

## 1. Tooling & Enforcement
- **Linter/Formatter**: ESLint + Prettier (Standard Next.js config).
- **Type Checking**: Strict TypeScript mode. No `any` allowed. Use `interface` for data structures and `type` for unions/aliases.

## 2. Next.js Best Practices
- **Server-First**: Default to Server Components. Only add `'use client'` at the leaf nodes of the component tree.
- **Server Actions**: All mutations must use Server Actions. Use `useFormStatus` or `useTransition` for pending states.
- **Safe Actions**: Wrap actions in a validation layer (like `zsa` or a custom Zod wrapper) to ensure input safety.

## 3. Data Integrity & Prisma
- **Zod Integration**: Use Zod to validate form data *before* passing it to Prisma.
- **Naming Conventions**: 
    - Components: PascalCase (`JobCard.tsx`)
    - Functions/Variables: camelCase (`getApplications`)
    - MySQL Tables: snake_case (managed in `schema.prisma`)

## 4. Error Handling
- **Graceful Failures**: Use `error.tsx` files for route-level error boundaries.
- **Action Responses**: Server Actions should return a standardized object: `{ success: boolean, data?: T, error?: string }`.