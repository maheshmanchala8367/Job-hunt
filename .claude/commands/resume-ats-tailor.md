---
name: resume-ats-tailor
description: >
  Expert ATS (Applicant Tracking System) resume tailoring skill for the current job market.
  Use this skill whenever the user wants to tailor, optimize, rewrite, or improve a resume
  against a specific job description, company, or role. Triggers include: "tailor my resume",
  "optimize for ATS", "update resume for this JD", "help me pass ATS", "rewrite my resume
  for this role", "add keywords to my resume", "why is my resume getting rejected", "make
  my resume ATS-friendly", "align resume to job posting", or any time the user shares both
  a resume and a job description together. Also trigger when the user asks about resume
  screening, keyword gaps, ATS scores, or recruiter filters — even if they don't say "ATS"
  explicitly. This skill covers the full tailoring pipeline: analysis, keyword extraction,
  rewriting, formatting, and final validation.
---

# Resume ATS Tailoring Skill

A comprehensive skill for tailoring resumes to pass modern ATS filters, beat keyword screening,
and land in front of human recruiters — reflecting the realities of the 2024–2025 job market.

---

## Context: How ATS Works in the Current Job Market

Before tailoring, understand the landscape:

- **70–80% of resumes are rejected by ATS before a human sees them** (iCIMS, Jobscan research).
- Most enterprise companies use ATS platforms: **Workday, Greenhouse, Lever, iCIMS, Taleo, BambooHR, SmartRecruiters**.
- ATS systems parse resumes into structured fields (name, title, skills, education, dates) and score them against job requirements using keyword matching, semantic similarity, and rule-based filters.
- Modern ATS (especially post-2023) use **AI-assisted screening** that goes beyond exact keyword matching to semantic relevance — but exact matches still score highest.
- **Recruiter time on a resume: 6–10 seconds** on first pass. The ATS pre-filters; the human skims.
- The current market (2024–2025) is highly competitive: more applicants per role, more automated rejection, higher bar for keyword precision.

---

## Step 1: Input Collection and Validation

Before doing any tailoring work, collect and confirm:

### Required Inputs
1. **Resume** — full current resume text (paste or uploaded file)
2. **Job Description (JD)** — full JD text (not just the title)

### Optional Inputs (ask if not provided)
- Target **company name** — for culture/tone calibration
- Target **role level** — (e.g., senior, lead, manager, entry-level) if not obvious from JD
- **Industry vertical** — if ambiguous (e.g., fintech vs. healthtech vs. enterprise SaaS)
- **Resume format preference** — chronological, hybrid, functional
- **Sections to prioritize** — e.g., "focus only on skills and summary"

If the resume or JD is missing, ask for it before proceeding. Do not fabricate content.

---

## Step 2: Deep JD Analysis

Parse the job description systematically before touching the resume.

### 2A. Extract Hard Requirements
Identify and categorize everything the JD explicitly requires:

**Must-Have (Hard Skills)**
- Technical tools, platforms, languages, frameworks explicitly listed
- Certifications or credentials listed as required (not preferred)
- Years of experience thresholds
- Domain knowledge explicitly required

**Nice-to-Have (Soft / Preferred)**
- Skills listed under "preferred", "nice to have", "bonus", "a plus"
- Soft skills mentioned (leadership, communication, cross-functional, etc.)
- Industry-specific experience that is preferred but not required

**Role-Level Signals**
- Scope of ownership (individual contributor vs. team lead vs. org leader)
- Decision-making authority signals (e.g., "own the roadmap", "partner with C-suite")
- Complexity signals (e.g., "at scale", "ambiguous environments", "greenfield")

### 2B. Extract ATS Keywords
Identify the exact keyword strings that ATS will scan for:

**Primary Keywords** — appear in the job title, first paragraph, or repeated 2+ times
**Secondary Keywords** — appear once in requirements or responsibilities
**Semantic Variants** — synonyms or related terms the ATS may also match
  - e.g., "machine learning" ↔ "ML", "artificial intelligence" ↔ "AI"
  - e.g., "stakeholder management" ↔ "executive communication" ↔ "cross-functional collaboration"

**Keyword Categories to Extract:**
- Job title variants (exact title + common alternatives)
- Hard technical skills (tools, languages, platforms, methodologies)
- Soft skills explicitly named in the JD
- Domain/industry terms
- Action verbs used in the JD responsibilities section
- Metrics language (e.g., "revenue growth", "cost reduction", "user retention")

### 2C. Identify the Core Value Proposition
Answer: *What is the #1 thing this employer needs someone to do or fix?*
This becomes the anchor for the summary rewrite.

---

## Step 3: Resume Audit

Analyze the existing resume against the JD findings.

### 3A. Keyword Gap Analysis
Create a clear gap map:

```
PRESENT (already in resume):     [list keywords found]
MISSING (in JD, not in resume):  [list keywords absent]
PARTIAL (wrong form or context): [list keywords present but misaligned]
```

### 3B. ATS Formatting Audit
Check for common ATS parsing failures:

**Problematic Formatting (flag and fix):**
- Tables, text boxes, columns — many ATS parsers cannot read these
- Headers and footers — often ignored by parsers
- Graphics, icons, logos — invisible to ATS
- Fancy fonts or non-standard characters — can corrupt parsing
- "Resume" as the file name (generic; offer to suggest a better one)
- Missing or inconsistently formatted dates (use Month YYYY format)
- Functional format with no clear chronology — ATS prefers reverse-chronological

**Safe Formatting Practices:**
- Single-column layout
- Standard section headers: Summary, Experience, Skills, Education, Certifications
- Consistent date format: Jan 2022 – Mar 2024 or 01/2022 – 03/2024
- Bullet points using standard characters (•, -, *)
- Contact info in the body, not in headers/footers
- File format: .docx preferred over PDF for most ATS (note this to user)

### 3C. Content Quality Audit
Evaluate existing bullets against best practices:

**Strong bullet anatomy:**
> [Action Verb] + [What you did] + [How / with what] + [Measurable Result]

**Flag bullets that are:**
- Responsibility-focused ("Responsible for managing...") instead of achievement-focused
- Missing metrics or quantification
- Too vague ("Worked on projects", "Helped with initiatives")
- Too long (over 2 lines) or too short (under 1 line)
- Using weak verbs (managed, helped, assisted, worked on)

---

## Step 4: Tailoring Execution

Execute changes in this order: Summary → Skills → Experience → Other Sections.

### 4A. Summary Rewrite

**Rules:**
- One paragraph, 3–5 sentences, 60–100 words
- Open with the exact job title from the JD (or close variant) + years of experience
- Include 4–6 high-value keywords from the JD naturally woven in
- Reflect actual background — do not fabricate experience
- Close with a value statement tied to the employer's core need (from Step 2C)
- No first-person pronouns (no "I", "my", "me")
- No company names
- No fluffy filler phrases: "results-driven", "passionate", "dynamic", "team player"

**Template pattern:**
> [Title] with [X] years of experience in [domain/function]. Proven track record of [achievement area 1] and [achievement area 2], with deep expertise in [keyword 1], [keyword 2], and [keyword 3]. [Role-specific value statement tied to employer's core need].

### 4B. Skills Section Rebuild

**Structure:** Use subsections that mirror industry norms for the target role.
**Content rules:**
- Keep all existing skills that are accurate and relevant
- Add missing JD-required skills the candidate actually has (just weren't listed)
- Mark newly added skills clearly (per user's preferred format)
- Remove skills that are outdated, irrelevant, or could age the candidate
- Order within each subsection: most JD-relevant first

**ATS note:** Many ATS scan the Skills section with high weight. Exact string matches matter.
- If JD says "Python" — the resume must say "Python" (not just imply it via project)
- If JD says "Agile" — don't only list "Scrum"; list both if accurate

### 4C. Experience Bullets — New Bullet Generation

**When adding new bullets:**
- Maximum 2 experience sections modified
- Maximum 2 new bullets per section
- New bullets must blend naturally with existing ones in tone, length, and verb tense
- Each new bullet must directly address a JD requirement
- Each new bullet must reflect something the candidate actually did (do not invent)

**Strong verb bank by function** (use these, not weak alternatives):

| Category | Strong Verbs |
|---|---|
| Leadership | Spearheaded, Orchestrated, Championed, Directed, Galvanized |
| Building | Architected, Engineered, Developed, Launched, Deployed, Designed |
| Growth | Accelerated, Drove, Scaled, Expanded, Grew, Generated |
| Analysis | Synthesized, Modeled, Forecasted, Identified, Evaluated, Diagnosed |
| Optimization | Streamlined, Reduced, Automated, Optimized, Refactored, Eliminated |
| Collaboration | Partnered, Aligned, Facilitated, Coordinated, Liaised |
| Communication | Presented, Authored, Evangelized, Translated, Documented |

**Quantification guidance:**
- Always try to attach a number, percentage, timeframe, or scale
- If exact numbers are unknown, use ranges or relative terms: "reduced by ~30%", "across 5 teams", "for 2M+ users"
- If no metric is available, quantify scope: "across 4 product lines", "for a $50M portfolio"

### 4D. Other Sections (if applicable)

**Certifications:** Add any JD-relevant certifications the candidate holds but didn't list.

**Education:** Only modify if JD has specific education requirements not reflected.

**Projects / Portfolio:** If JD emphasizes hands-on work and experience bullets are thin,
suggest adding a Projects section with 2–3 entries using the same bullet structure.

**Volunteer / Leadership:** Only include if directly relevant to JD requirements.

---

## Step 5: ATS Score Estimation

After tailoring, provide an estimated ATS alignment score and breakdown.

### Scoring Dimensions (rate each 1–10, weight as shown):

| Dimension | Weight | What to Evaluate |
|---|---|---|
| Keyword Coverage | 35% | % of primary + secondary JD keywords present in resume |
| Title Alignment | 20% | How closely resume title / summary title matches JD title |
| Skills Match | 20% | % of required skills explicitly listed in Skills section |
| Experience Relevance | 15% | How well experience bullets map to JD responsibilities |
| Formatting Safety | 10% | No ATS-breaking formatting elements present |

**Composite score = weighted average × 10**

**Score interpretation:**
- 85–100: Strong pass — likely to clear ATS and reach recruiter
- 70–84: Moderate — will pass many ATS but may be filtered by stricter systems
- 55–69: Weak — high risk of rejection; significant gaps remain
- Below 55: Likely rejected — major keyword and/or formatting issues

Report the score honestly. If below 70, identify the top 3 specific actions to close the gap.

---

## Step 6: Output Format

Structure the final output clearly in the following order:

---

### JD Analysis Summary
- Core value proposition (1 sentence)
- Primary keywords found: [list]
- Secondary keywords found: [list]
- Hard requirements: [list]
- Preferred requirements: [list]

---

### Keyword Gap Report
- Present in resume: [list]
- Missing from resume: [list]
- Partial matches to fix: [list]

---

### Tailored Resume Output

**Summary:**
[rewritten paragraph]

**Skills:**
[each subsection with existing + newly added skills marked]

**Experience — New Bullets Only:**
[Role Title, Company, Dates]
• [new bullet 1]
• [new bullet 2]

[Second Role Title if applicable]
• [new bullet 1]
• [new bullet 2]

---

### ATS Score Estimate
- Keyword Coverage: X/10
- Title Alignment: X/10
- Skills Match: X/10
- Experience Relevance: X/10
- Formatting Safety: X/10
- **Composite ATS Score: XX/100**

---

### Formatting Fixes Applied
[List any formatting issues found and the specific fix applied — do not ask the user to fix these separately, apply them inline]

---

## Step 7: Recruiter Layer (Beyond ATS)

If the ATS score is strong (85+), shift focus to the human reader layer:

**Recruiter scan pattern:** Title → Summary → Most recent role → Skills → Education

**Recruiter red flags to eliminate:**
- Employment gaps over 6 months (suggest brief explanation strategy)
- Job hopping (3+ jobs in under 3 years) — suggest grouping contract/freelance roles
- Outdated skills prominently placed (e.g., listing Flash, COBOL at the top)
- Inconsistent tense (past tense for past roles, present tense for current role)
- Email addresses that look unprofessional
- Missing LinkedIn URL (recruiters always check)
- Objective statement instead of summary (outdated; replace with summary)

**Recruiter green flags to add or emphasize:**
- Brand-name companies, clients, or partners (if applicable)
- Awards, rankings, top-performer designations
- Revenue, cost, scale, or growth metrics
- Promotion history within the same company
- Cross-functional scope ("partnered with Engineering, Marketing, and Finance")

---

## Quality Checklist (Run Before Delivering Output)

Before finalizing the tailored resume output, verify:

- [ ] Every new bullet starts with a strong past-tense action verb
- [ ] No bullet exceeds 2 lines
- [ ] No first-person pronouns anywhere
- [ ] Summary is 60–100 words, one paragraph, no company names
- [ ] All primary JD keywords appear at least once in the resume
- [ ] Skills section contains no skills the candidate doesn't actually have
- [ ] No formatting elements that break ATS parsing
- [ ] Dates are consistently formatted
- [ ] New bullets match the tone and style of existing bullets in that role
- [ ] ATS score estimate is provided with honest breakdown
- [ ] 100% of primary JD keywords are placed in at least 2 resume locations
- [ ] 80%+ of secondary JD keywords are placed in at least 1 resume location
- [ ] Every missing keyword lands in Skills section at minimum
- [ ] No keyword appears more than 3 times (avoid stuffing penalties)
- [ ] Every injected keyword is load-bearing in its sentence — reads naturally, cannot be removed without breaking the bullet

---

## Common ATS Platform Notes

Tailor advice slightly if the user mentions a specific ATS:

| Platform | Key Notes |
|---|---|
| **Workday** | Struggles with PDFs; recommend .docx. Parses tables poorly. Strong keyword matching. |
| **Greenhouse** | Handles PDFs well. Scores heavily on skills section. LinkedIn import common. |
| **Taleo (Oracle)** | Oldest/strictest parser. Avoid all special characters, tables, columns. Plain text safest. |
| **Lever** | More modern; handles formatting better. Semantic matching used. |
| **iCIMS** | Strong keyword scanner. Title field carries heavy weight. |
| **BambooHR** | Common at SMBs; simpler parsing. Less strict on formatting. |
| **SmartRecruiters** | AI-assisted screening. Semantic matching means keyword variants work. |

If the user doesn't know which ATS the company uses, recommend the safest universal format:
single-column, .docx, standard section headers, no tables or graphics.

---

## Industry-Specific Keyword Patterns

Reference these when the JD's industry is identifiable:

**Software Engineering / Tech:**
Must-haves: specific languages, frameworks, cloud platforms, CI/CD tools, system design, agile/scrum
Watch for: "full-stack", "distributed systems", "microservices", "API design", "observability"

**Data & Analytics:**
Must-haves: SQL, Python/R, specific BI tools, data modeling, ETL/ELT, statistical methods
Watch for: "data governance", "self-serve analytics", "stakeholder storytelling", "dbt", "Snowflake"

**Product Management:**
Must-haves: roadmapping, prioritization frameworks, cross-functional, OKRs, user research, go-to-market
Watch for: "0-to-1", "platform vs. product", "discovery", "north star metric", "B2B vs. B2C"

**Marketing:**
Must-haves: specific channels (SEO, paid, email, content), analytics tools, CRM, campaign metrics
Watch for: "demand generation", "pipeline influence", "CAC/LTV", "attribution modeling"

**Finance:**
Must-haves: financial modeling, FP&A, specific ERP systems, GAAP/IFRS, forecasting, variance analysis
Watch for: "business partnering", "scenario modeling", "board reporting", "M&A"

**Operations / Supply Chain:**
Must-haves: process improvement, Lean/Six Sigma, ERP systems, vendor management, KPIs
Watch for: "S&OP", "last-mile", "3PL", "demand planning", "fulfillment at scale"

**People / HR:**
Must-haves: HRIS platforms, talent acquisition, performance management, compliance, DEI
Watch for: "HRBP", "workforce planning", "total rewards", "change management"

---

## Tone Calibration by Role Level

Adjust language register based on seniority:

**Individual Contributor (IC):**
- Focus on technical execution, tools mastery, output quality
- Metrics: velocity, accuracy, throughput, delivery speed
- Verbs: built, developed, implemented, resolved, delivered

**Senior / Staff IC:**
- Add cross-team impact, mentorship, technical leadership
- Metrics: team productivity lift, adoption rates, system reliability
- Verbs: architected, led, mentored, standardized, championed

**Manager / Director:**
- Shift to team outcomes, hiring, budget, strategy execution
- Metrics: headcount, budget managed, OKR attainment, retention
- Verbs: built, scaled, hired, directed, owned, transformed

**VP / Executive:**
- Focus on org-level impact, business outcomes, board/investor-facing work
- Metrics: revenue, P&L, market share, enterprise-wide change
- Verbs: defined, drove, orchestrated, established, led

---

## ATS Keyword Injection Strategy

The primary objective is **100% coverage of all primary and secondary JD keywords**
in the tailored resume. Every missing keyword must land somewhere in the output —
summary, skills section, or experience bullets — naturally and without disrupting
the resume's readability or flow.

Do not flag gaps. Do not leave keywords unplaced. Find a home for every single one.

---

### Injection Priority Order

Place each missing keyword in the highest-priority location where it fits naturally:

```
1. Skills Section       → always the first and easiest placement
2. Summary Paragraph    → for broad competency terms and role-level keywords
3. New Experience Bullet → for tool-specific or methodology-specific keywords
4. Rewritten Existing Bullet → for keywords that map to work already described
```

A keyword can and should appear in **multiple locations** if it is a primary JD keyword
(appears in job title, first paragraph, or 2+ times in the JD). Repetition across
sections increases ATS score.

---

### Rule 1: Skills Section — Inject All Missing Keywords Directly

Every missing JD keyword that is a tool, technology, language, platform, methodology,
or framework goes into the Skills section — no conditions, no qualifiers.

- Scan every JD keyword against every existing skills subsection
- Place each missing keyword in the most appropriate subsection
- Use the exact string from the JD (ATS matches exact strings)
  - JD says "Apache Spark" → add "Apache Spark", not just "Spark"
  - JD says "CI/CD" → add "CI/CD", not just "DevOps"
  - JD says "RESTful APIs" → add "RESTful APIs" exactly
- If the keyword doesn't fit cleanly into any existing subsection, add it to the
  closest one — do not create new subsections

**Skills section is a keyword container. Fill it completely.**

---

### Rule 2: Summary — Inject Broad and Role-Level Keywords

The summary must contain the job title (exact match to JD) and all primary keywords
that define the role's domain. Weave them in as natural competency claims.

**Injection technique — competency absorption:**
Take the missing keyword and attach it to the candidate's strongest existing claim.

Examples:
- Missing "machine learning" → "...delivering data solutions leveraging machine learning
  and statistical modeling to drive business outcomes"
- Missing "stakeholder management" → "...partnering with cross-functional stakeholders
  and senior leadership to align technical strategy with business goals"
- Missing "cloud-native" → "...designing cloud-native architectures that scale across
  enterprise environments"
- Missing "Agile" → "...delivering high-impact solutions in fast-paced Agile environments"

The summary absorbs up to 6–8 keywords naturally. Prioritize primary JD keywords here.

---

### Rule 3: New Experience Bullets — Inject Tool and Method Keywords

For missing keywords that are too specific for the summary (specific tools, platforms,
methodologies), inject them via new experience bullets written around the candidate's
most relevant existing role.

**Bullet injection formula:**
> [Strong Verb] + [work the candidate actually did] + [using/leveraging {missing keyword}]
> + [outcome or scale]

The missing keyword slots in as the **instrument** of work already done — not as a
new claim of what was done.

Examples:
- Missing "dbt" → "Engineered modular data transformation workflows using dbt to
  standardize pipeline logic across 15+ data sources, reducing model refresh time by 40%"
- Missing "Kubernetes" → "Deployed containerized microservices using Kubernetes to
  orchestrate workloads across multi-cloud environments, improving deployment reliability"
- Missing "A/B testing" → "Drove product experimentation through rigorous A/B testing
  frameworks, informing feature prioritization decisions across 3 product lines"
- Missing "NLP" → "Applied NLP techniques to extract structured insights from
  unstructured customer feedback data, reducing manual review effort by 60%"

**Write the bullet so the keyword is load-bearing — it cannot be removed without
breaking the sentence. This is what makes it read naturally, not bolted on.**

---

### Rule 4: Rewrite Existing Bullets to Absorb Keywords

Before writing a new bullet, check if an existing bullet can be rewritten to
naturally absorb the missing keyword. This is preferred because it doesn't add
length to the resume.

**Rewrite technique — keyword elevation:**
Find the existing bullet whose work most closely relates to the missing keyword.
Rewrite it to make the keyword explicit.

Examples:
- Existing: "Built automated reporting pipelines to reduce manual work"
  Missing keyword: "ETL"
  Rewritten: "Architected ETL pipelines to automate data ingestion and reporting
  workflows, eliminating 20+ hours of manual processing per week"

- Existing: "Worked with product and engineering teams on quarterly planning"
  Missing keyword: "cross-functional collaboration"
  Rewritten: "Led cross-functional collaboration across Product, Engineering, and
  Finance to align quarterly roadmap priorities with business OKRs"

- Existing: "Analyzed customer data to identify trends"
  Missing keyword: "predictive analytics"
  Rewritten: "Applied predictive analytics to customer behavioral data, surfacing
  early churn signals that informed retention strategy for 500K+ users"

---

### Rule 5: Keyword Density Check

After all injections, run a final keyword density pass:

- Every **primary keyword** (appears in JD title or 2+ times): must appear in
  at least 2 resume locations (e.g., Skills + Summary, or Skills + bullet)
- Every **secondary keyword** (appears once in JD): must appear in at least
  1 resume location
- No keyword should appear more than 3 times total — beyond that it reads as
  keyword stuffing and some modern ATS penalize it

**Target: 90–100% of JD primary keywords covered, 80%+ of secondary keywords covered.**

---

### Absolute Hard Limits (the only ones)

These are the only lines that are never crossed regardless of keyword pressure:

- Do not fabricate employment dates, job titles, or company names
- Do not claim academic degrees or certifications not held
- Do not invent specific metrics (revenue figures, headcount, percentages) with
  no basis in the candidate's actual work
- Do not add a keyword if doing so makes a bullet factually false in a verifiable way

Everything else — reframing, elevating, absorbing, implying, generalizing —
is not only acceptable but required to maximize ATS passage rate.
