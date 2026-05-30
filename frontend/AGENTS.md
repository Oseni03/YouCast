# Frontend AI Agent Instructions

## Purpose
Help AI agents make consistent frontend changes in the YouCast Next.js application.

## Key frontend conventions
- The app uses Next.js 14 App Router with TypeScript, Tailwind CSS, and React.
- Data access is implemented through hooks in `frontend/src/hooks/` and API helpers in `frontend/src/lib/`.
- UI components should follow the `DESIGN.md` "Soft Minimalism" system and the no-line rule.
- Prefer background-tone separation over borders for layout sections.
- Avoid adding a global state library; use existing hooks and component-local state.

## Important folders
- `frontend/src/app/` — page routes and layout structure
- `frontend/src/components/` — reusable UI pieces and auth/provider components
- `frontend/src/hooks/` — custom hooks for auth, channels, episodes, and analytics
- `frontend/src/lib/` — API services, types, and helper utilities

## Build and local development
```bash
cd frontend
npm install
npm run dev
```

## Linting and formatting
```bash
npm run lint
npm run format
```

## Where to read first
- `frontend/README.md` — frontend setup and Next.js guidance
- `DESIGN.md` — visual style, color palette, typography, and component rules
- `README.md` — overall project context and stack

## What to avoid
- Do not introduce explicit 1px borders for layout boundaries.
- Do not restructure the app away from Next.js App Router without a strong reason.
- Do not replace the existing API service/hook pattern with a new global state framework.

## Useful quick facts
- Key hooks: `frontend/src/hooks/useAuth.ts`, `useChannels.ts`, `useEpisodes.ts`, `useAnalytics.ts`
- API helpers and service calls live in `frontend/src/lib/api-services.ts` and `frontend/src/lib/api.ts`
- The UI should maintain the polished editorial look described in `DESIGN.md`
