export type AppSection =
  | 'dashboard'
  | 'job-search'
  | 'job-tracker'
  | 'resume-match'
  | 'resume-rewriter'
  | 'interview-prep'
  | 'profile'
  | 'general';

interface PromptContext {
  section: AppSection;
  userGoal?: string;
  dataSnapshot?: string;
}

const SECTION_INSTRUCTIONS: Record<AppSection, string> = {
  dashboard:
    'Give broad job search strategy, motivation, next-step recommendations, and help the user prioritize their pipeline.',
  'job-search':
    'Help the user refine their search queries, understand job descriptions, compare roles, and identify the best opportunities for their background.',
  'job-tracker':
    'Help the user manage their application pipeline, prioritize follow-ups, draft follow-up emails, and interpret recruiter signals.',
  'resume-match':
    'Focus on ATS optimization, impact-driven bullet points, and keyword alignment with the job description.',
  'resume-rewriter':
    'Help tailor the resume for the specific role. Emphasize achievements, keyword density for ATS, and natural phrasing. Never invent experience.',
  'interview-prep':
    'Provide STAR-format answer frameworks, common questions for the role, follow-up question suggestions, and company-specific preparation tips.',
  profile:
    'Help the user write a compelling resume summary or improve their resume text for broader reuse.',
  general:
    'Give broad, actionable job search advice tailored to the user\'s specific situation.',
};

export function buildSystemPrompt(ctx: PromptContext): string {
  const sectionExtra = SECTION_INSTRUCTIONS[ctx.section] || SECTION_INSTRUCTIONS.general;

  let prompt = `You are an expert career coach and job search strategist embedded in the Job Hunt Toolkit app. \
You help users write strong resumes and cover letters, prepare for interviews, research companies, negotiate offers, and stay organized during their job search. \
Be concise, actionable, warm, and specific. Avoid generic advice — always tailor your response to the user's actual situation.

Current section: ${ctx.section}
Section-specific focus: ${sectionExtra}`;

  if (ctx.userGoal) {
    prompt += `\n\nUser's stated goal: ${ctx.userGoal}`;
  }

  if (ctx.dataSnapshot) {
    prompt += `\n\nContext from the current page: ${ctx.dataSnapshot}`;
  }

  return prompt;
}

export const STARTER_PROMPTS: Record<AppSection, string[]> = {
  dashboard: [
    'Where should I focus my job search today?',
    'How do I stand out as a candidate?',
    'Review my job search strategy',
  ],
  'job-search': [
    'How do I decode this job description?',
    'What are red flags in a job posting?',
    'How do I find hidden job market opportunities?',
  ],
  'job-tracker': [
    'Which applications should I follow up on?',
    'Draft a follow-up email for me',
    'How long should I wait before following up?',
  ],
  'resume-match': [
    'Review my current bullet points',
    'How do I tailor this for the job description?',
    'What keywords am I missing?',
  ],
  'resume-rewriter': [
    'Help me rewrite my summary',
    'Make these bullets more impactful',
    'How do I quantify achievements without numbers?',
  ],
  'interview-prep': [
    "Help me answer 'Tell me about yourself'",
    'Give me 5 likely questions for this role',
    'What should I ask the interviewer?',
  ],
  profile: [
    'Help me write a strong resume summary',
    'What should every resume include?',
    'Review my resume for common mistakes',
  ],
  general: [
    'Where should I focus today?',
    'How do I stand out as a candidate?',
    'Review my job search strategy',
  ],
};
