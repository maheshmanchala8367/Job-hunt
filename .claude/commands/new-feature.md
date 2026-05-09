Scaffold a complete new feature page in the Job Hunt Toolkit dashboard.

Feature to build: $ARGUMENTS

## What you must do

### 1. Create the page
Create `src/app/dashboard/<feature-name>/page.tsx` as a `'use client'` component.
Follow the existing page structure:
```tsx
'use client';
import { useState, useEffect } from 'react';
// ... imports

export default function <FeatureName>Page() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Feature Title</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Subtitle</p>
      </div>
      {/* content */}
    </div>
  );
}
```

### 2. Add to sidebar navigation
Edit `src/components/layout/sidebar.tsx` — add to the `navItems` array:
```tsx
{ href: '/dashboard/<feature-name>', icon: <IconName>, label: 'Feature Name' }
```
Pick an icon from `lucide-react`.

### 3. Create API routes
Create `src/app/api/<feature-name>/route.ts` for GET/POST.
Create `src/app/api/<feature-name>/[id]/route.ts` for PATCH/DELETE if needed.

Always start with:
```ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
// ...
const session = await getServerSession(authOptions);
if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
```

### 4. Add Prisma model (if storing data)
Edit `prisma/schema.prisma` — add the model then run:
```
npx prisma generate
npx prisma migrate dev --name add-<feature-name>
```

### 5. Add AI integration (if needed)
Use the shared `callAI` from `src/lib/ai.ts`:
```ts
import { callAI } from '@/lib/ai';
const result = await callAI(userPrompt, systemPrompt);
```
Always ask for **strict JSON** output and wrap in try/catch.

### 6. CSS classes to use
Use existing Tailwind component classes — do NOT add custom CSS:
- `.card` — white rounded panel with shadow
- `.btn-primary` — indigo filled button
- `.btn-secondary` — outlined button
- `.input` — styled text input
- `.label` — form label
- `animate-fade-in` — page entrance animation
- `dark:` variants — already handled by these classes

### 7. Check
- `npx tsc --noEmit --skipLibCheck` — fix all errors
- Test in browser: `npm run dev`

## Key reference files
- `src/app/dashboard/interview-prep/page.tsx` — best example of a full feature page
- `src/app/dashboard/job-tracker/page.tsx` — example with Prisma + charts
- `src/components/layout/sidebar.tsx` — navigation
- `src/lib/ai.ts` — AI integration
- `prisma/schema.prisma` — data models
