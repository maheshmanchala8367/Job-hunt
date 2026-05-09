export type AppSection =
  | 'dashboard' | 'job-search' | 'job-tracker' | 'resume-match'
  | 'resume-rewriter' | 'interview-prep' | 'profile' | 'general';

const SECTION_CONTEXT: Record<AppSection, string> = {
  dashboard: 'Give broad job search strategy, motivation, next-step recommendations, and help the user prioritize their pipeline.',
  'job-search': 'Help refine search queries, decode job descriptions, compare roles, identify keywords, and evaluate fit.',
  'job-tracker': 'Help manage the application pipeline, draft follow-up emails, interpret recruiter signals, and decide on prioritization.',
  'resume-match': 'Focus on ATS optimization, impact-driven bullet points, keyword alignment, and improving the match score.',
  'resume-rewriter': 'Help tailor the resume for the specific role. Emphasize achievements and keyword density without inventing experience.',
  'interview-prep': 'Provide STAR-format answer frameworks, common questions for the role, follow-up question suggestions, and company-specific tips.',
  profile: 'Help write a compelling resume summary or improve resume text for broader reuse.',
  general: 'Give broad, actionable job search advice tailored to the user\'s specific situation.',
};

export interface PromptContext {
  section: AppSection;
  dataSnapshot?: string;
}

export function buildSystemPrompt(ctx: PromptContext): string {
  return `You are an expert career coach and job search strategist embedded in the Job Hunt Toolkit app.
You help users write strong resumes and cover letters, prepare for interviews, research companies, negotiate offers, and stay organized.
Be concise, actionable, warm, and specific. Avoid generic advice — always tailor your response to the user's actual situation.
Format responses with markdown: use **bold**, bullet lists, numbered steps, and \`code\` blocks where appropriate.

Current section: ${ctx.section}
Section focus: ${SECTION_CONTEXT[ctx.section] || SECTION_CONTEXT.general}${ctx.dataSnapshot ? `\n\nContext from current page:\n${ctx.dataSnapshot}` : ''}`;
}

export const STARTER_PROMPTS: Record<AppSection, string[]> = {
  dashboard: ['Where should I focus my search today?', 'How do I stand out as a candidate?', 'Review my job search strategy'],
  'job-search': ['How do I decode this job description?', 'What are red flags in a job posting?', 'How do I find hidden job market opportunities?'],
  'job-tracker': ['Which applications should I follow up on?', 'Draft a follow-up email for me', 'How long should I wait before following up?'],
  'resume-match': ['Review my current bullet points', 'How do I tailor for this JD?', 'What keywords am I missing?'],
  'resume-rewriter': ['Help me rewrite my summary', 'Make these bullets more impactful', 'How do I quantify without hard numbers?'],
  'interview-prep': ["Help me answer 'Tell me about yourself'", 'Give me 5 likely questions for this role', 'What should I ask the interviewer?'],
  profile: ['Help me write a strong resume summary', 'What should every resume include?', 'Review my resume for common mistakes'],
  general: ['Where should I focus today?', 'How do I stand out?', 'Review my job search strategy'],
};
