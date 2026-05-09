'use client';

import { useState } from 'react';
import { Eye, EyeOff, Zap, X } from 'lucide-react';

interface Props {
  onSave: (key: string, endpoint: string, model: string) => void;
  onDismiss?: () => void;
  isSettings?: boolean;
  initialKey?: string;
  initialEndpoint?: string;
  initialModel?: string;
}

export function CredentialsModal({ onSave, onDismiss, isSettings, initialKey = '', initialEndpoint = '', initialModel = '' }: Props) {
  const [key, setKey] = useState(initialKey);
  const [endpoint, setEndpoint] = useState(initialEndpoint || 'https://api.openai.com/v1/chat/completions');
  const [model, setModel] = useState(initialModel || '');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');

  function handleSave() {
    if (!key.trim() || !endpoint.trim()) {
      setError('API key and endpoint URL are both required.');
      return;
    }
    try { new URL(endpoint); } catch { setError('Please enter a valid URL.'); return; }
    onSave(key.trim(), endpoint.trim(), model.trim());
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {isSettings ? 'Update AI Settings' : 'Connect your AI API'}
            </h2>
          </div>
          {onDismiss && (
            <button onClick={onDismiss} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        <div className="p-5 space-y-4">
          {!isSettings && (
            <p className="text-sm text-gray-500 leading-relaxed">
              Ask AI uses your own API key to call any OpenAI-compatible endpoint. Your credentials are stored only in your browser — never on our servers.
            </p>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <div>
            <label className="label">API Key *</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="sk-..."
                className="input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="label">API Endpoint URL *</label>
            <input
              type="url"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://api.openai.com/v1/chat/completions"
              className="input"
            />
            <p className="text-xs text-gray-400 mt-1">
              OpenAI: .../v1/chat/completions · Anthropic: .../v1/messages · Ollama: http://localhost:11434/v1/chat/completions
            </p>
          </div>

          <div>
            <label className="label">Model name (optional)</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gpt-4o, claude-sonnet-4-6, llama3…"
              className="input"
            />
          </div>

          {isSettings && (
            <button
              onClick={() => {
                localStorage.removeItem('ai_api_key');
                localStorage.removeItem('ai_api_endpoint');
                localStorage.removeItem('ai_model_name');
                onDismiss?.();
              }}
              className="w-full text-center text-xs text-red-500 hover:underline py-1"
            >
              Clear all credentials
            </button>
          )}
        </div>

        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
          {onDismiss && (
            <button onClick={onDismiss} className="btn-secondary flex-1">Cancel</button>
          )}
          <button onClick={handleSave} className="btn-primary flex-1">
            {isSettings ? 'Save Settings' : 'Save & Start Chatting'}
          </button>
        </div>
      </div>
    </div>
  );
}
