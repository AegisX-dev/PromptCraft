'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuota } from './context/QuotaContext';

export default function Home() {
  const { data: session } = useSession();
  const { basicQuota, proQuota, spendQuota } = useQuota();

  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'basic' | 'pro'>('basic');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleRefine = async (mode: 'basic' | 'pro') => {
    setLoading(true);
    setError('');
    setResponse('');

    try {
      const apiPath = mode === 'basic' ? '/api/refine/basic' : '/api/refine/pro';
      
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        if (res.status === 402) {
          setError('Quota exceeded. Check back tomorrow!');
        } else {
          setError('An error occurred. Please try again.');
        }
        return;
      }

      const data = await res.json(); // data is now just the text string
      setResponse(data);
      spendQuota(mode);
    } catch (err) {
      setError('Failed to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center px-4">
        <div className="max-w-2xl text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Welcome to <span className="text-blue-400">PromptCraft</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Your AI-powered prompt library and Project Decomposer for modern developers.
          </p>
          <p className="text-lg text-gray-400">
            Please <span className="text-blue-400 font-semibold">log in</span> to start refining your prompts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-gray-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            AI Prompt Refiner
          </h1>
          <p className="text-gray-300">
            Transform your vague ideas into actionable, high-quality prompts
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 mb-6">
          <label className="block text-white font-semibold mb-3 text-lg">
            Enter Your Prompt:
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., Build a Twitter clone with MERN..."
            className="w-full h-40 p-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />

          <div className="mt-4">
            <p className="text-gray-400 text-sm mb-2">Or try an example:</p>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setPrompt('Build a MERN Twitter clone')}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-lg transition-colors"
              >
                MERN Twitter Clone
              </button>
              <button
                onClick={() => setPrompt('I am getting a "Text content does not match" hydration error in my NEXT.js app')}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-lg transition-colors"
              >
                Debug React Hydration Error
              </button>
            </div>
          </div>

          <div className="flex gap-4 mt-6 items-center">
            <div className="flex-1">
              <label className="block text-white text-sm font-medium mb-2">
                Refine Mode:
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as 'basic' | 'pro')}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="basic">Basic ({basicQuota} left)</option>
                <option value="pro">Pro ({proQuota} left)</option>
              </select>
            </div>
            <div className="flex-1 pt-7">
              <button
                onClick={() => handleRefine(mode)}
                disabled={loading || (mode === 'basic' && basicQuota <= 0) || (mode === 'pro' && proQuota <= 0)}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-lg"
              >
                {loading ? 'Processing...' : 'Refine'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-2xl p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-xl">
              Refined Output:
            </h2>
            {response && (
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {copied ? '✓ Copied!' : 'Copy to Clipboard'}
              </button>
            )}
          </div>

          <div className="refined-output-container">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                <span className="ml-4 text-gray-300 text-lg">Loading...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-900 border border-red-600 text-red-200 px-6 py-4 rounded-lg">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
              </div>
            )}

            {response && (
              <pre className="text-left whitespace-pre-wrap p-4 bg-gray-700 rounded-md text-gray-100">
                {response}
              </pre>
            )}

            {!loading && !error && !response && (
              <p className="text-gray-400 italic text-center py-8">
                Your refined prompt will appear here...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
