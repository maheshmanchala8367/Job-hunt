'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AskAIPanel } from './panel';
import type { AppSection } from './build-system-prompt';

function sectionFromPath(path: string): AppSection {
  if (path.includes('job-search')) return 'job-search';
  if (path.includes('job-tracker')) return 'job-tracker';
  if (path.includes('resume-match')) return 'resume-match';
  if (path.includes('resume-rewriter')) return 'resume-rewriter';
  if (path.includes('interview-prep')) return 'interview-prep';
  if (path.includes('profile')) return 'profile';
  if (path.includes('dashboard')) return 'dashboard';
  return 'general';
}

export function AskAIWidget() {
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(true);
  const pathname = usePathname();
  const section = sectionFromPath(pathname);

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Ask AI"
        className={cn(
          'fixed bottom-4 right-4 z-[70] flex items-center gap-2 px-4 py-3 rounded-full',
          'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg',
          'hover:from-indigo-700 hover:to-purple-700 transition-all active:scale-95',
          open && 'from-indigo-700 to-purple-700 shadow-xl scale-95'
        )}
      >
        {pulse && !open && (
          <span className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-40" />
        )}
        <Sparkles className={cn('w-4 h-4 transition-transform', open && 'rotate-180')} />
        <span className="text-sm font-semibold">Ask AI</span>
      </button>

      {open && (
        <AskAIPanel section={section} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
