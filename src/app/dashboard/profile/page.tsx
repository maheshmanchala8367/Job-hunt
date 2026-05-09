'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { User, FileText, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { getInitials } from '@/lib/utils';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState('');
  const [baseResume, setBaseResume] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((data) => {
        setName(data.name ?? '');
        setBaseResume(data.baseResume ?? '');
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, baseResume }),
    });
    setSaving(false);
    if (res.ok) {
      setMessage({ type: 'success', text: 'Profile saved successfully!' });
      await update({ name });
    } else {
      setMessage({ type: 'error', text: 'Failed to save. Please try again.' });
    }
  }

  const initials = getInitials(name, session?.user?.email);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account and base resume.</p>
      </div>

      {loading ? (
        <div className="card p-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4" /> Personal Information
            </h2>
            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden">
                {session?.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-lg">{name || session?.user?.email}</p>
                <p className="text-sm text-gray-500">{session?.user?.email}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="label">Display name</label>
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className="input" />
              </div>
              <div>
                <label className="label">Email address</label>
                <input type="email" value={session?.user?.email ?? ''} disabled className="input opacity-60 cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Base Resume
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Save your resume once. Resume Match, Rewriter, Ask AI, and Interview Prep load it automatically.
            </p>
            <textarea
              rows={18}
              value={baseResume}
              onChange={(e) => setBaseResume(e.target.value)}
              placeholder="Paste your full resume text here…"
              className="input resize-none font-mono text-xs leading-relaxed"
            />
            <p className="text-xs text-gray-400 mt-2">
              {baseResume.length > 0 ? `${baseResume.length.toLocaleString()} characters` : 'No resume saved yet'}
            </p>
          </div>

          {message && (
            <div className={`flex items-center gap-2 p-3 rounded-xl text-sm border ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              {message.text}
            </div>
          )}

          <button type="submit" disabled={saving} className="btn-primary w-full py-3">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      )}

      <div className="card p-6 border-red-200 dark:border-red-900">
        <h2 className="font-semibold text-red-700 dark:text-red-400 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">Permanently delete your account and all data. This cannot be undone.</p>
        <button className="px-4 py-2 rounded-xl border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}
