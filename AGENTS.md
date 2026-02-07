# Repository Guidelines

## Project Structure & Module Organization

Source lives in `src`: routes in `src/app`, shared UI in `src/components`, hooks/providers in `src/hooks` and `src/providers`, and domain logic in `src/lib`. Type definitions sit in `src/types`, static assets in `public`, and deployment settings in `netlify.toml`. Use the `@/*` alias and keep secrets in `src/lib/server`.

## Build, Test, and Development Commands

- `pnpm install` — required; the `preinstall` script blocks other package managers.
- `pnpm dev` — launches the Next.js dev server with hot reload.
- `pnpm build` / `pnpm start` — create and preview the production bundle (Netlify runs `pnpm build`).
- `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm check` — run ESLint, TypeScript, Prettier verification, or all checks at once.
- `pnpm format` — write Prettier output (with sorted imports).

## Coding Style & Naming Conventions

Stick to TypeScript and prefer server components unless a browser-only API forces `use client`. Prettier handles two-space indentation, double quotes, trailing commas, and sorted imports. Components use PascalCase filenames (e.g., `CartProductCard.tsx`) and Tailwind utility classes. Read environment variables through helpers in `src/lib/server` rather than inline `process.env` access.

## Testing Guidelines

There is no automated suite yet; gate changes with `pnpm lint`, `pnpm typecheck`, and targeted UI checks in `src/components/ui`. When adding tests, colocate `*.spec.ts[x]` files, use React Testing Library with Vitest, and wire them to `pnpm test`. Mock `fetch`, store fixtures under `src/lib/__mocks__`, and document manual QA steps in pull requests until CI coverage exists.

## Commit & Pull Request Guidelines

Write short imperative commit subjects (e.g., `Add checkout delivery flow`), add a brief body for context, and reference issues with `Refs #123`. Pull requests should explain the change, list validation steps, include UI screenshots when relevant, and note environment updates. Keep Husky hooks green by rerunning `pnpm lint-staged` if necessary.

## Environment & Deployment Notes

Netlify runs `pnpm build` and expects credentials described in `src/lib/server/config.ts` (`RETAILCRM_*`, `YOOKASSA_*`). Configure both production and test secrets in Netlify before release, avoid hardcoded fallbacks, and sanity-check RetailCRM endpoints in both modes.
