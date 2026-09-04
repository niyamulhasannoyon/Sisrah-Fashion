'use client';

import React, { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Fatal Root Application Error:', error);
  }, [error]);

  const handleHardReload = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <html lang="en">
      <head>
        <title>Application Error | AS SIDRAT</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          backgroundColor: '#FAFAFA',
          color: '#1A1A1A',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '520px',
            width: '90%',
            margin: '2rem auto',
            padding: '2.5rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
            textAlign: 'center',
            border: '1px solid #EEEEEE',
          }}
        >
          {/* Logo or Icon */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#FEE2E2',
              color: '#A31F24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              fontSize: '28px',
              fontWeight: 'bold',
            }}
          >
            !
          </div>

          <h1
            style={{
              fontSize: '24px',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              margin: '0 0 0.75rem 0',
              color: '#111827',
            }}
          >
            Critical System Error
          </h1>

          <p
            style={{
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#4B5563',
              margin: '0 0 0.5rem 0',
            }}
          >
            We apologize for the inconvenience. A critical error occurred while loading the application core.
          </p>

          <p
            style={{
              fontSize: '13px',
              lineHeight: '1.5',
              color: '#6B7280',
              margin: '0 0 2rem 0',
            }}
          >
            অ্যাপ্লিকেশনটি লোড করতে একটি অপ্রত্যাশিত সমস্যা দেখা দিয়েছে। দয়া করে পেজটি রিলোড করুন।
          </p>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                backgroundColor: '#A31F24',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.03em',
              }}
            >
              Try Again / পুনরায় চেষ্টা করুন
            </button>

            <button
              type="button"
              onClick={handleHardReload}
              style={{
                backgroundColor: '#1F2937',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.03em',
              }}
            >
              Reload Website
            </button>
          </div>

          {error?.digest && (
            <p
              style={{
                marginTop: '1.5rem',
                fontSize: '11px',
                color: '#9CA3AF',
                fontFamily: 'monospace',
              }}
            >
              Digest: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
