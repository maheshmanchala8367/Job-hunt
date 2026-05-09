import Link from 'next/link';
import {
  Search, Briefcase, FileSearch, FileEdit, MessageSquare, Target,
  ArrowRight, CheckCircle, Zap, Globe, Clock,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

const tools = [
  {
    icon: Search,
    name: 'Live Job Search',
    tagline: 'Search 38+ job boards at once',
    description:
      'Scrape live listings from Greenhouse, Lever, Ashby, LinkedIn, Wellfound, Y Combinator, and 32 more sources in real time. Filter by posted 4h · 8h · 12h · 24h · this week.',
    color: 'from-violet-500 to-purple-600',
    badge: 'NEW',
  },
  {
    icon: Briefcase,
    name: 'Job Tracker',
    tagline: 'Every application, organized',
    description:
      'Log every application with status, notes, salary, and links. Move cards across pipeline stages and never miss a follow-up.',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: FileSearch,
    name: 'Resume Match',
    tagline: 'Know your score before you apply',
    description:
      'Paste a job description and your resume. Get an instant match score, matched skills, and a gap analysis powered by AI.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: FileEdit,
    name: 'Resume Rewriter',
    tagline: 'Tailor every application in seconds',
    description:
      'Rewrite your resume for any role — professional, ATS-optimized, or concise — with one click. Your base resume stays saved.',
    color: 'from-orange-500 to-amber-600',
  },
  {
    icon: MessageSquare,
    name: 'Ask AI',
    tagline: 'Your job-search co-pilot',
    description:
      'Ask anything: negotiate salary, decode job requirements, draft cover letters, write LinkedIn messages. Context-aware chat that knows your resume.',
    color: 'from-pink-500 to-rose-600',
  },
  {
    icon: Target,
    name: 'Interview Prep',
    tagline: 'Walk in ready, not nervous',
    description:
      'Generate role-specific behavioral and technical questions, practice with timed mock interviews, and get instant feedback on your answers.',
    color: 'from-indigo-500 to-blue-600',
  },
];

const steps = [
  { n: '1', title: 'Create your account', desc: 'Sign up with email or Google in under 30 seconds.' },
  { n: '2', title: 'Save your base resume', desc: 'Paste your resume once. Every tool reuses it automatically.' },
  { n: '3', title: 'Start your job search', desc: 'Search live listings, track applications, and let AI do the heavy lifting.' },
];

const features = [
  'Single sign-on across all tools',
  'Real-time job scraping from 38+ sources',
  'Time filters: 4h · 8h · 12h · 24h · week',
  'ATS-aware resume matching',
  'Dark mode & mobile-first design',
  'All data tied to one account',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* ── Navigation ──────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">Job Hunt Toolkit</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link href="/auth/register" className="btn-primary">
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-4 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6 border border-indigo-200 dark:border-indigo-800">
            <Globe className="w-3.5 h-3.5" />
            Live job scraping from 38+ sources
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight mb-6">
            Land your dream job{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              faster
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Six AI-powered tools in one place — search live listings, track every application, tailor
            your resume, and walk into every interview prepared.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="btn-primary text-base px-6 py-3">
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/auth/login" className="btn-secondary text-base px-6 py-3">
              Sign in
            </Link>
          </div>
          <p className="text-sm text-gray-400 mt-4">No credit card required · Takes 30 seconds</p>
        </div>
      </section>

      {/* ── Tools Grid ──────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to land the role
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Six tools, one account, zero switching costs.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((t) => (
              <div key={t.name} className="card p-6 group hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center mb-4 shadow-sm`}>
                  <t.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.name}</h3>
                  {t.badge && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                      {t.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">{t.tagline}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Job Search Highlight ─────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="card p-8 sm:p-12 bg-gradient-to-br from-indigo-600 to-purple-700 border-0 text-white">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-indigo-200" />
                <span className="text-indigo-200 font-medium text-sm">Real-time job scraping</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Search 38+ job boards simultaneously
              </h2>
              <p className="text-indigo-100 text-lg leading-relaxed mb-6">
                Greenhouse, Lever, Ashby, LinkedIn, Glassdoor, Wellfound, Y Combinator, Remote OK,
                Workday, iCIMS, SmartRecruiters, and 27 more — all searched in one go.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                {['Last 4 hours', 'Last 8 hours', 'Last 12 hours', 'Last 24 hours', 'Last week', 'All time'].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-indigo-100">
                    <CheckCircle className="w-4 h-4 text-indigo-300 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-14">
            Up and running in 3 steps
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.n} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white text-xl font-bold flex items-center justify-center shadow">
                  {s.n}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{s.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature list + CTA ──────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Built for focused job seekers
            </h2>
            <ul className="space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Start your search today
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm leading-relaxed">
              Free to use. No credit card required. All six tools available from day one.
            </p>
            <Link href="/auth/register" className="btn-primary w-full text-base py-3 justify-center">
              Create free account <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-sm text-gray-400 mt-3">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Job Hunt Toolkit</span>
          </div>
          <p>© {new Date().getFullYear()} Job Hunt Toolkit. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
