import React from 'react';

/**
 * Official SVG Icons and Helper Functions for WhatsApp and Facebook Messenger
 */

export function WhatsAppIcon({ className = 'w-5 h-5', fill = 'currentColor' }: { className?: string; fill?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={fill}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67ZM8.84 7.02C8.63 7.02 8.41 7.03 8.22 7.21C8.03 7.4 7.47 7.93 7.47 9.02C7.47 10.11 8.26 11.16 8.37 11.31C8.48 11.46 9.93 13.7 12.15 14.66C13.99 15.46 14.37 15.3 14.78 15.26C15.19 15.22 16.1 14.72 16.29 14.19C16.48 13.66 16.48 13.21 16.42 13.11C16.36 13.01 16.21 12.96 15.98 12.85C15.75 12.74 14.63 12.19 14.42 12.11C14.21 12.03 14.06 11.99 13.91 12.22C13.76 12.45 13.33 12.96 13.2 13.11C13.07 13.26 12.94 13.28 12.71 13.17C12.48 13.06 11.75 12.82 10.88 12.04C10.2 11.43 9.74 10.68 9.61 10.46C9.48 10.23 9.6 10.11 9.71 10 9.82 9.89 9.95 9.72 10.06 9.59C10.17 9.46 10.21 9.37 10.29 9.22C10.36 9.07 10.33 8.94 10.27 8.82C10.21 8.71 9.76 7.6 9.57 7.15C9.39 6.71 9.21 6.77 9.07 6.76L8.84 7.02Z" />
    </svg>
  );
}

export function MessengerIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="messengerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00C6FF" />
          <stop offset="50%" stopColor="#0078FF" />
          <stop offset="100%" stopColor="#A800FF" />
        </linearGradient>
      </defs>
      <path
        fill="url(#messengerGradient)"
        d="M12 2C6.48 2 2 6.03 2 11C2 13.83 3.44 16.35 5.71 17.92V21.5L9.12 19.63C10.04 19.89 11.01 20.03 12 20.03C17.52 20.03 22 16 22 11C22 6.03 17.52 2 12 2ZM13.05 14.54L10.51 11.83L5.56 14.54L11.01 8.76L13.59 11.47L18.49 8.76L13.05 14.54Z"
      />
    </svg>
  );
}

export function MessengerSolidIcon({ className = 'w-5 h-5', fill = 'currentColor' }: { className?: string; fill?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={fill}>
      <path d="M12 2C6.48 2 2 6.03 2 11C2 13.83 3.44 16.35 5.71 17.92V21.5L9.12 19.63C10.04 19.89 11.01 20.03 12 20.03C17.52 20.03 22 16 22 11C22 6.03 17.52 2 12 2ZM13.05 14.54L10.51 11.83L5.56 14.54L11.01 8.76L13.59 11.47L18.49 8.76L13.05 14.54Z" />
    </svg>
  );
}

/**
 * Format phone number into clean WhatsApp URL
 */
export function getWhatsAppUrl(rawPhone?: string, prefilledText?: string): string {
  const phone = (rawPhone || '8801975745270').replace(/[^0-9]/g, '');
  const base = `https://wa.me/${phone}`;
  if (!prefilledText) return base;
  return `${base}?text=${encodeURIComponent(prefilledText.trim())}`;
}

/**
 * Extract handle or construct Facebook Messenger URL
 */
export function getMessengerUrl(
  messengerUrl?: string,
  facebookUrl?: string,
  prefilledText?: string,
  defaultHandle = 'assidrat'
): string {
  // 1. Explicit messenger URL or username
  if (messengerUrl && messengerUrl.trim()) {
    let clean = messengerUrl.trim();
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      return prefilledText ? `${clean}?text=${encodeURIComponent(prefilledText.trim())}` : clean;
    }
    // Just a username or m.me/handle
    clean = clean.replace(/^m\.me\//, '').replace(/^@/, '');
    const base = `https://m.me/${clean}`;
    return prefilledText ? `${base}?text=${encodeURIComponent(prefilledText.trim())}` : base;
  }

  // 2. Parse from facebookUrl
  if (facebookUrl && facebookUrl.trim()) {
    const raw = facebookUrl.trim().replace(/\/+$/, '');
    if (raw.includes('m.me/')) {
      const parts = raw.split('m.me/');
      const handle = parts[1]?.split(/[?#]/)[0] || defaultHandle;
      const base = `https://m.me/${handle}`;
      return prefilledText ? `${base}?text=${encodeURIComponent(prefilledText.trim())}` : base;
    }

    try {
      const match = raw.match(/(?:https?:\/\/)?(?:www\.)?facebook\.com\/(?:pages\/[^\/]+\/)?([^\/?#]+)/i);
      if (match && match[1] && !['profile.php', 'sharer', 'dialog'].includes(match[1])) {
        const handle = match[1];
        const base = `https://m.me/${handle}`;
        return prefilledText ? `${base}?text=${encodeURIComponent(prefilledText.trim())}` : base;
      }
    } catch {
      // Fallback
    }

    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return raw;
    }
  }

  // 3. Fallback default
  const base = `https://m.me/${defaultHandle}`;
  return prefilledText ? `${base}?text=${encodeURIComponent(prefilledText.trim())}` : base;
}
