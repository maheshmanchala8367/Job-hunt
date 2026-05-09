Build or improve the Offer Negotiation Coach feature of the Job Hunt Toolkit.

Task: $ARGUMENTS

## Feature overview
The Negotiation Coach activates when a user logs a job offer in the Job Tracker. It:
1. Analyzes the offer vs. market compensation data
2. Estimates negotiation headroom
3. Role-plays as the recruiter so the user can practice the negotiation conversation
4. Generates ready-to-send counter-offer scripts (email + talking points)
5. Identifies which levers to pull beyond base salary

## Architecture (to build)
```
JobTracker (offer detected) → NegotiationCoach modal/page
  → /api/negotiation/analyze  → callAI → offer analysis + headroom estimate
  → /api/negotiation/roleplay → callAI (stateful conversation as recruiter)
  → /api/negotiation/script   → callAI → email + talking points
  → prisma.negotiationSession → saved sessions
```

## Files to create
| File | Purpose |
|---|---|
| `src/app/dashboard/negotiation/page.tsx` | Full coach UI |
| `src/app/api/negotiation/analyze/route.ts` | Offer analysis endpoint |
| `src/app/api/negotiation/roleplay/route.ts` | Recruiter role-play chat |
| `src/app/api/negotiation/script/route.ts` | Generate negotiation scripts |
| `src/components/negotiation/offer-form.tsx` | Offer input form |
| `src/components/negotiation/roleplay-chat.tsx` | Chat UI for role-play |
| `src/components/negotiation/script-view.tsx` | Email + talking points display |

## Prisma model to add
```prisma
model NegotiationSession {
  id              String   @id @default(cuid())
  userId          String
  jobApplicationId String?  // linked JobApplication if exists
  company         String
  role            String
  offeredBase     Int      // in USD/local currency
  offeredEquity   String?
  offeredBonus    String?
  offeredBenefits String?
  location        String?
  remotePolicy    String?  // "remote" | "hybrid" | "onsite"
  yearsExp        Int?
  marketP50       Int?     // AI-estimated market median
  marketP75       Int?
  headroom        Int?     // estimated negotiation room in $
  targetBase      Int?     // user's counter-offer target
  outcome         String?  // "accepted" | "countered" | "rejected" | "pending"
  finalBase       Int?
  messages        Json     // role-play conversation history
  scripts         Json     // generated email + talking points
  createdAt       DateTime @default(now())
  user            User     @relation(...)
}
```

## Offer analysis AI prompt
```
You are a compensation expert and negotiation coach.

The user has received this job offer:
- Role: {role} at {company}
- Location: {location} ({remotePolicy})
- Base salary: ${offeredBase}
- Equity: {equity}
- Bonus: {bonus}
- Benefits: {benefits}
- Years of experience: {yearsExp}

Respond with strict JSON:
{
  "marketP50": 145000,
  "marketP75": 165000,
  "marketP90": 185000,
  "headroomEstimate": 15000,
  "headroomConfidence": "medium",
  "offerStrength": "below-market" | "at-market" | "above-market",
  "levers": [
    { "lever": "Base salary", "potential": "+$10-15k", "likelihood": "high", "script": "..." },
    { "lever": "Signing bonus", "potential": "+$10k", "likelihood": "high", "script": "..." },
    { "lever": "Extra equity", "potential": "+0.1% vested over 2y", "likelihood": "medium", "script": "..." },
    { "lever": "Extra PTO", "potential": "+5 days", "likelihood": "high", "script": "..." },
    { "lever": "Remote days", "potential": "Full remote", "likelihood": "medium", "script": "..." }
  ],
  "redFlags": ["Equity cliff is 2 years instead of standard 1 year"],
  "summary": "This offer is ~8% below market for your experience level in this location..."
}
```

## Recruiter role-play system prompt
```
You are a recruiter at {company} who has just extended a job offer.
The candidate is trying to negotiate. Stay in character as a realistic recruiter:
- You have budget flexibility of roughly ${headroom} (but don't reveal this)
- Use realistic recruiter objections: "Our bands are fixed", "We've already stretched", "Let me check with the hiring manager"
- Be firm but not hostile — you want to close this hire
- After each candidate message, respond in character AND add a coaching note in [brackets]:
  [Coach: good use of competing offer as leverage. Next, anchor higher before they counter]
- If the candidate makes a strong argument, yield ground realistically
- If they ask about specific levers (equity, signing, PTO), respond as a real recruiter would
```

## Counter-offer script prompt
```
Generate a professional counter-offer email and a verbal talking points script.

Offer details: {offerDetails}
User's target: ${targetBase} base
Top levers to negotiate: {levers}

Return strict JSON:
{
  "email": {
    "subject": "Re: Offer for {role} position",
    "body": "Full email text..."
  },
  "talkingPoints": [
    "Opening: Express genuine enthusiasm first — never start with money",
    "Anchor: State your target number confidently without apologizing",
    "Justify: Reference market data and your specific value-add",
    "Alternative levers: If base is fixed, pivot to signing bonus...",
    "Closing: Always leave the door open — 'I'm excited and want to make this work'"
  ],
  "objectionHandlers": [
    { "objection": "Our bands are fixed", "response": "I understand — in that case, could we look at a signing bonus to bridge the gap?" },
    { "objection": "We already stretched", "response": "I really appreciate that. Could we revisit the equity component instead?" }
  ]
}
```

## UI flow to implement
1. User marks application as "Offer" in Job Tracker → "Start Negotiation Coach" button appears
2. User fills offer form (base, equity, bonus, location, remote policy, YOE)
3. AI analyzes offer → shows strength gauge, market comparison, lever list
4. User picks levers to negotiate → enters Role-Play mode
5. Chat interface: user types what they'd say, AI responds as recruiter + coaching note
6. After 5+ exchanges → "Generate Scripts" button
7. Scripts view: copyable email + talking points card

## Common tasks
- **Integrate with Job Tracker**: detect `status === 'offer'` and show the coach CTA in job card
- **Add salary data**: integrate Levels.fyi or Glassdoor salary data via scraping or their API
- **Add outcome tracking**: after negotiation, user logs final result → builds dataset for future advice
- **Add comparison**: if user has multiple offers, show side-by-side comparison matrix
