'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertOctagon,
  RefreshCw,
  LayoutDashboard,
  ChevronDown,
  ChevronUp,
  Terminal,
  RotateCcw,
} from 'lucide-react';

interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: AdminErrorProps) {
  const [showStack, setShowStack] = useState(false);

  useEffect(() => {
    console.error('[Admin Console Error Boundary Captured]:', {
      message: error?.message,
      digest: error?.digest,
      stack: error?.stack,
    });
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 md:p-8">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 text-slate-100 shadow-2xl space-y-6">
        {/* Top Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <AlertOctagon size={26} />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-red-400 font-bold block">
              Admin Console Exception
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Dashboard Operation Interrupted
            </h2>
          </div>
        </div>

        {/* Error Message Box */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 font-mono text-xs text-red-300 break-all space-y-1">
          <p className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider">
            Exception Message:
          </p>
          <p className="text-sm font-sans text-red-200">
            {error?.message || 'An unhandled exception occurred in the admin component tree.'}
          </p>
          {error?.digest && (
            <p className="text-[11px] text-slate-500 pt-1">
              Next.js Digest Reference: <span className="text-slate-300">{error.digest}</span>
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md active:scale-95"
          >
            <RefreshCw size={14} />
            <span>Retry Operation</span>
          </button>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all active:scale-95"
          >
            <LayoutDashboard size={14} />
            <span>Back to Dashboard</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-transparent hover:bg-slate-800/60 border border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all active:scale-95"
          >
            <RotateCcw size={14} />
            <span>Hard Refresh</span>
          </button>
        </div>

        {/* Expandable Stack Trace */}
        <div className="border-t border-slate-800/80 pt-4">
          <button
            type="button"
            onClick={() => setShowStack(!showStack)}
            className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 font-mono py-1 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Terminal size={14} className="text-red-400" />
              <span>Stack Trace & Diagnostics</span>
            </span>
            {showStack ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showStack && (
            <div className="mt-3 p-3.5 bg-black/80 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 max-h-60 overflow-auto whitespace-pre-wrap leading-relaxed">
              {error?.stack || 'No client stack trace available.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
