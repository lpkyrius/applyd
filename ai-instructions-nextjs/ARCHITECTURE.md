# ARCHITECTURE.md: Next.js & SQLite Architectural Guardrails

This document defines the structural boundaries and architectural patterns for **Applyd**. Our goal is to maintain a decoupled, type-safe, and AI-ready ecosystem using the Next.js App Router and a local SQLite database for rapid development.

## 1. High-Level Architecture
- **Framework**: Next.js 14+ (App Router).
- **Pattern**: Hybrid Architecture. We use **Server Components** for data fetching and **Server Actions** for mutations.
- **Development Philosophy**: "Local-first" development using SQLite for portability and ease of setup.

## 2. Tech Stack & Data Flow
- **Persistence**: SQLite (Local file-based database).
- **ORM**: [Prisma](https://www.prisma.io/).
- **Data Access**: Prisma Client is used exclusively within Server Components or Server Actions. 
- **UI Engine**: Tailwind CSS + shadcn/ui.

## 3. Layer Responsibilities
- **App Layer (`src/app`)**: Routing and Layouts. Server-side data fetching happens here.
- **Action Layer (`src/lib/actions`)**: Standardized Server Actions for POST/PATCH/DELETE operations.
- **Data Layer (`prisma/schema.prisma`)**: Single source of truth. The provider is set to `sqlite`.

## 4. SQLite Specifics
- **Database File**: Stored locally (usually `dev.db` in the `/prisma` folder).
- **Concurrency**: Note that SQLite handles concurrent writes differently than MySQL; keep transactions simple.
- **Migration**: Prisma Migrate is used to sync the schema with the local `.db` file.

## 5. Folder Structure
Standard Next.js App Router structure (src directory) as defined in CODING_GUIDELINES.md.