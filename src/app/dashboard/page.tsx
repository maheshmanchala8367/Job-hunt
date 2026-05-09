'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Search, Briefcase, FileSearch, FileEdit, MessageSquare, Target,
  TrendingUp, Clock, ArrowRight, Loader2,
} from 'lucide-react';
import { relativeTime } from '@/lib/utils';

interface Stats {
  totalApplications: number;
  lastResumeMatch: { score: number; createdAt: string } | null;
  interviewSessionsThisWeek: number;
  totalAskAiSessions: number;
  totalRewrites: number;
  recentApplications: { id: string; company: string; role: string; status: string; appliedAt: string }[];
}

const statusColors: Record<string, string> = {
  applied: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
  interview: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
  offer: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  rejected: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
  ghosted: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
};

const quickLinks = [
  { href: '/dashboard/job-search', label: 'Search Jobs', icon: Search, desc: 'Live listings from 38+ boards', color: 'from-violet-500 to-purple-600' },
  { href: '/dashboard/job-tracker', label: 'Job Tracker', icon: Briefcase, desc: 'Track your applications', color: 'from-blue-500 to-cyan-600' },
  { href: '/dashboard/resume-match', label: 'Resume Match', icon: FileSearch, desc: 'Score your fit', color: 'from-emerald-500 to-teal-600' },
  { href: '/dashboard/resume-rewriter', label: 'Resume Rewriter', icon: FileEdit, desc: 'Tailor for any role', color: 'from-orange-500 to-amber-600' },
  { href: '/dashboard/ask-ai', label: 'Ask AI', icon: MessageSquare, desc: 'Your job-search co-pilot', color: 'from-pink-500 to-rose-600' },
  { href: '/dashboard/interview-prep', label: 'Interview Prep', icon: Target, desc: 'Practice & get ready', color: 'from-indigo-500 to-blue-600' },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data && !data.error) setStats(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const firstName = session?.user?.name?.split(' ')[0] ?? 'there';

  const statCards = [
    {
      label: 'Total Applications',
      value: loading ? '…' : stats?.totalApplications ?? 0,
      icon: Briefcase,
      href: '/dashboard/job-tracker',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      label: 'Last Match Score',
      value: loading ? '…' : stats?.lastResumeMatch ? `${stats.lastResumeMatch.score}%` : '—',
      icon: TrendingUp,
      href: '/dashboard/resume-match',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950',
    },
    {
      label: 'Interview Prep (week)',
      value: loading ? '…' : stats?.interviewSessionsThisWeek ?? 0,
      icon: Target,
      href: '/dashboard/interview-prep',
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950',
    },
    {
      label: 'AI Conversations',
      value: loading ? '…' : stats?.totalAskAiSessions ?? 0,
      icon: MessageSquare,
      href: '/dashboard/ask-ai',
      color: 'text-pink-600 dark:text-pink-400',
      bg: 'bg-pink-50 dark:bg-pink-950',
    },
    {
      label: 'Resume Rewrites',
      value: loading ? '…' : stats?.totalRewrites ?? 0,
      icon: FileEdit,
      href: '/dashboard/resume-rewriter',
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Good {getGreeting()}, {firstName}! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's your job search at a glance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="card p-5 hover:shadow-md transition-all group"
          >
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" /> : s.value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
              {s.label}
            </div>
          </Link>
        ))}
      </div>

      {/* Quick access */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickLinks.map(({ href, label, icon: Icon, desc, color }) => (
            <Link
              key={href}
              href={href}
              className="card p-4 flex flex-col items-center text-center gap-2 hover:shadow-md transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white leading-tight">{label}</span>
              <span className="text-xs text-gray-400 leading-tight hidden sm:block">{desc}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent applications */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Recent Applications</h2>
            <Link href="/dashboard/job-tracker" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : !stats?.recentApplications.length ? (
            <div className="text-center py-10 text-gray-400">
              <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No applications yet.</p>
              <Link href="/dashboard/job-tracker" className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline">
                Start tracking →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">{app.role}</p>
                    <p className="text-xs text-gray-500 truncate">{app.company}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[app.status] ?? statusColors.applied}`}>
                      {app.status}
                    </span>
                    <span className="text-xs text-gray-400 hidden sm:block">{relativeTime(app.appliedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips card */}
        <div className="card p-6 bg-gradient-to-br from-indigo-600 to-purple-700 border-0 text-white">
          <h2 className="text-base font-semibold mb-3">💡 Today's tip</h2>
          <p className="text-indigo-100 text-sm leading-relaxed mb-4">
            Tailor your resume for each application. Even small changes — swapping in keywords from
            the job description — can significantly increase your ATS score.
          </p>
          <Link
            href="/dashboard/resume-rewriter"
            className="inline-flex items-center gap-2 text-sm font-medium bg-white/20 hover:bg-white/30 transition-colors px-3 py-2 rounded-lg"
          >
            Try Resume Rewriter <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
