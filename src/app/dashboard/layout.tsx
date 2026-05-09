import { TopNav } from '@/components/top-nav';
import { AskAIWidget } from '@/components/ask-ai';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopNav />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>
      <AskAIWidget />
    </div>
  );
}
