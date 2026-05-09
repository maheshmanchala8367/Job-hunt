'use client';

import { MessageSquare, ArrowRight } from 'lucide-react';

const capabilities = [
  { icon: '📝', title: 'Cover letters', desc: 'Write, tailor, and refine cover letters for any role in seconds.' },
  { icon: '💰', title: 'Salary negotiation', desc: 'Scripts, tactics, and counter-offer coaching for any offer.' },
  { icon: '🔍', title: 'JD decoder', desc: 'Understand what a job description really wants and identify hidden requirements.' },
  { icon: '📧', title: 'Outreach & follow-ups', desc: 'Draft cold outreach, recruiter messages, and thank-you emails.' },
  { icon: '🧠', title: 'Interview strategy', desc: 'Prepare answers, predict questions, and research companies.' },
  { icon: '📊', title: 'Pipeline advice', desc: 'Prioritize applications and decide where to focus your energy.' },
];

const sectionGuide = [
  { section: 'Job Search', hint: 'Refining search terms, decoding job descriptions' },
  { section: 'Job Tracker', hint: 'Follow-up timing, pipeline prioritization, email drafts' },
  { section: 'Resume Match', hint: 'ATS tips, keyword strategy, score improvement' },
  { section: 'Resume Rewriter', hint: 'Bullet point coaching, tone advice, impact framing' },
  { section: 'Interview Prep', hint: 'STAR answers, question prediction, research prep' },
];

export default function AskAIPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="card p-8 bg-gradient-to-br from-indigo-600 to-purple-700 border-0 text-white text-center">
        <div className="text-5xl mb-4">✦</div>
        <h1 className="text-3xl font-bold mb-3">Ask AI</h1>
        <p className="text-indigo-100 text-lg leading-relaxed max-w-lg mx-auto mb-6">
          Your context-aware job-search co-pilot. It knows which section of the app you're in and tailors every answer to your situation.
        </p>
        <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm font-medium">
          ✦ Click the Ask AI button in the bottom-right corner to start chatting
        </div>
      </div>

      {/* Capabilities grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">What you can ask</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {capabilities.map((c) => (
            <div key={c.title} className="card p-5 flex items-start gap-4">
              <span className="text-2xl shrink-0">{c.icon}</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{c.title}</p>
                <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Context-aware guide */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-600" /> Context-aware by section
        </h2>
        <div className="space-y-3">
          {sectionGuide.map((s) => (
            <div key={s.section} className="flex items-center gap-3 text-sm">
              <span className="font-medium text-gray-900 dark:text-white w-36 shrink-0">{s.section}</span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="text-gray-500">{s.hint}</span>
            </div>
          ))}
        </div>
      </div>

      {/* API key note */}
      <div className="card p-6 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
        <h2 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">🔑 Bring your own API key</h2>
        <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
          Ask AI uses <strong>your own API credentials</strong>, stored only in your browser — never on our servers.
          Works with any OpenAI-compatible endpoint: OpenAI, Anthropic, Ollama, and more.
          Click the ✦ Ask AI button and you'll be prompted to enter your key on first use.
        </p>
      </div>
    </div>
  );
}
