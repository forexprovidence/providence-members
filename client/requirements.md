## Packages
(none needed)

## Notes
Uses existing shadcn/ui components under client/src/components/ui
Auth: use /api/login, /api/logout, /api/auth/user (provided by Replit Auth blueprint)
Frontend assumes REST JSON under /api/* described by @shared/routes (not yet present in repo); UI/hook files will compile once shared/routes.ts exists
All fetches include credentials: "include"
