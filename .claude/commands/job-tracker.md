Work on the Job Tracker feature of the Job Hunt Toolkit.

Task: $ARGUMENTS

## Feature overview
The Job Tracker lets users manage their job applications through a Kanban board with status columns (Saved → Applied → Phone Screen → Interview → Offer → Rejected). It includes charts, CSV import/export, and AI-powered suggestions.

## Architecture
```
page.tsx (Kanban UI + charts) → /api/jobs/[id] (CRUD) → Prisma → PostgreSQL (Neon)
                              → /api/jobs/import (CSV) 
                              → /api/jobs/export (CSV)
                              → /api/dashboard/stats (aggregate stats)
```

## Key files
| File | Purpose |
|---|---|
| `src/app/dashboard/job-tracker/page.tsx` | Full Kanban UI, drag-drop, charts |
| `src/app/api/jobs/route.ts` | GET (list), POST (create) |
| `src/app/api/jobs/[id]/route.ts` | PATCH (update status/notes), DELETE |
| `src/app/api/jobs/import/route.ts` | CSV import via papaparse |
| `src/app/api/jobs/export/route.ts` | CSV export |
| `src/app/api/dashboard/stats/route.ts` | Counts by status, recent activity |
| `prisma/schema.prisma` | JobApplication model |

## Database model (JobApplication)
```prisma
model JobApplication {
  id          String   @id @default(cuid())
  userId      String
  company     String
  title       String
  status      String   @default("saved")
  location    String?
  salary      String?
  url         String?
  notes       String?
  appliedAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(...)
}
```

## Status values (exact strings used in DB)
`saved` | `applied` | `phone_screen` | `interview` | `offer` | `rejected`

## Charts used
- **BarChart** (Recharts): applications per week
- **PieChart** (Recharts): status distribution
- **AreaChart** (Recharts): cumulative applications over time

## CSV import format
Headers: `company,title,status,location,salary,url,notes,appliedAt`
Dates: ISO 8601 or any format parseable by `new Date()`

## Common tasks
- **Add a new status column**: add to status array in page.tsx + update API validation + update DB enum if needed
- **Add a chart**: import chart type from recharts, add to the charts section in page.tsx
- **Add a field**: add to Prisma schema → `npx prisma migrate dev` → update API routes → update UI form
- **Fix stats**: edit `src/app/api/dashboard/stats/route.ts` — model is `prisma.jobApplication`

## Schema changes
Always run after changing `prisma/schema.prisma`:
```
npx prisma generate
npx prisma migrate dev --name describe-change
```
