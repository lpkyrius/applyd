# TESTING.md: Testing Strategy for Applyd

## 1. Frameworks
- **Unit/Integration**: Vitest or Jest with React Testing Library.
- **E2E**: Playwright (for critical flows like "Add New Application").

## 2. Testing Levels
- **Components**: Focus on user interactions and accessibility (ARIA roles).
- **Server Actions**: Test logic in isolation by mocking the Prisma Client.
- **Hooks**: Use `@testing-library/react-hooks` for complex UI logic.

## 3. Mocking
- **Database**: Use a separate MySQL test container or mock `PrismaClient` using `jest-mock-extended`.
- **Authentication**: Use mock providers to simulate logged-in/logged-out states.

## 4. CI/CD Integration
- **Pre-push**: Run `npm run lint` and `npm run test`.
- **Build Check**: Ensure `npm run build` passes before merging to `main`.