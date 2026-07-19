'use client';

import { useState, useEffect, useRef } from 'react';
import {
  X,
  Loader2,
  Download,
  Send,
  FileText,
  AlertCircle,
  CheckCircle2,
  Eye,
  ExternalLink,
} from 'lucide-react';

interface InvoicePreviewModalProps {
  orderId: string;
  orderNumber?: string;
  customerEmail?: string;
  onClose: () => void;
}

export default function InvoicePreviewModal({
  orderId,
  orderNumber,
  customerEmail,
  onClose,
}: InvoicePreviewModalProps) {
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [emailAddress, setEmailAddress] = useState(customerEmail || '');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Track whether the component is still mounted for safe state updates
  const cancelledRef = useRef(false);

  const fetchInvoicePreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/invoice/generate?orderId=${orderId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate invoice preview');
      }
      const data = await res.json();
      if (cancelledRef.current) return;
      if (data.success && data.pdf) {
        setPdfDataUrl(data.pdf);
      } else {
        throw new Error(data.error || 'Failed to generate invoice preview');
      }
    } catch (err: unknown) {
      if (cancelledRef.current) return;
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      if (!cancelledRef.current) setLoading(false);
    }
  };

  // Fetch the invoice PDF on mount
  useEffect(() => {
    cancelledRef.current = false;
    fetchInvoicePreview();
    return () => { cancelledRef.current = true; };
  }, [orderId]);



  const handleDownload = async () => {
    if (!pdfDataUrl) return;
    setDownloading(true);
    try {
      // Fetch the PDF as blob for proper download
      const res = await fetch(`/api/invoice/generate?orderId=${orderId}&download=true`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${orderNumber || orderId.slice(-6)}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback: try downloading via the data URL
      if (pdfDataUrl) {
        const a = document.createElement('a');
        a.href = pdfDataUrl;
        a.download = `Invoice-${orderNumber || orderId.slice(-6)}.pdf`;
        a.click();
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailAddress || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
      return;
    }
    setSendingEmail(true);
    try {
      const res = await fetch('/api/admin/orders/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, customEmail: emailAddress }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailSent(true);
        setTimeout(() => {
          setShowEmailInput(false);
          setEmailSent(false);
        }, 3000);
      } else {
        alert(`❌ ${data.error || 'Failed to send invoice'}`);
      }
    } catch (err) {
      alert('❌ Network error. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  const displayOrderNum = orderNumber || `#${orderId.slice(-6).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#8B1A1A]/10 flex items-center justify-center">
              <FileText size={18} className="text-[#8B1A1A]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                Invoice Preview
                <span className="text-[10px] font-mono font-bold text-[#8B1A1A] bg-[#8B1A1A]/5 px-2 py-0.5 rounded-md border border-[#8B1A1A]/10">
                  {displayOrderNum}
                </span>
              </h2>
              <p className="text-[10px] text-slate-500 font-medium">
                Preview the invoice PDF before downloading or emailing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Action Bar ── */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-50/80 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
              <Eye size={14} className="text-slate-400" />
              PDF Preview
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Email Invoice Button */}
            <button
              onClick={() => setShowEmailInput(!showEmailInput)}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5"
            >
              <Send size={12} />
              {showEmailInput ? 'Hide Email' : 'Email Invoice'}
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={!pdfDataUrl || downloading}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Download size={12} />
              )}
              Download PDF
            </button>

            {/* Open in new tab */}
            {pdfDataUrl && (
              <a
                href={pdfDataUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5"
                title="Open in new tab"
              >
                <ExternalLink size={12} />
                Open
              </a>
            )}
          </div>
        </div>

        {/* ── Email Input Bar (conditional) ── */}
        {showEmailInput && (
          <div className="px-6 py-3 bg-blue-50/50 border-b border-blue-100 shrink-0 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="email"
                  placeholder="customer@example.com"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className={`flex-1 border px-3 py-2 rounded-lg text-xs font-medium outline-none transition-all ${
                    emailAddress && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)
                      ? 'border-emerald-300 bg-white'
                      : 'border-slate-200 bg-white'
                  } focus:border-slate-400`}
                />
                {customerEmail && (
                  <span className="text-[9px] text-slate-500 font-medium whitespace-nowrap">
                    On file: <strong className="text-slate-700">{customerEmail}</strong>
                  </span>
                )}
              </div>
              <button
                onClick={handleSendEmail}
                disabled={sendingEmail || !emailAddress || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                {sendingEmail ? (
                  <><Loader2 size={12} className="animate-spin" /> Sending...</>
                ) : emailSent ? (
                  <><CheckCircle2 size={12} /> Sent!</>
                ) : (
                  <><Send size={12} /> Send</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── PDF Viewer Area ── */}
        <div className="flex-1 bg-slate-100/50 min-h-[400px] sm:min-h-[500px] relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white z-10">
              {/* Premium loading skeleton */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-[#8B1A1A]/5 flex items-center justify-center">
                    <FileText size={24} className="text-[#8B1A1A]/30" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5">
                    <Loader2 size={20} className="animate-spin text-[#8B1A1A]" />
                  </div>
                </div>
                <div className="text-center space-y-1.5">
                  <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Generating Invoice
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Rendering your premium PDF invoice...
                  </p>
                </div>
              </div>
              {/* Skeleton bar */}
              <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-[#8B1A1A]/20 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white z-10 p-8">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                <AlertCircle size={24} className="text-red-500" />
              </div>
              <div className="text-center space-y-1.5 max-w-md">
                <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Preview Unavailable
                </p>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  {error}
                </p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={fetchInvoicePreview}
                  className="px-4 py-2 bg-[#8B1A1A] hover:bg-[#A31F24] text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all shadow-sm"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {pdfDataUrl && !loading && (
            <iframe
              src={pdfDataUrl}
              className="w-full h-full border-0 min-h-[500px]"
              title="Invoice PDF Preview"
            />
          )}
        </div>

        {/* ── Footer Hint ── */}
        <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-100 shrink-0 flex items-center justify-between">
          <p className="text-[9px] text-slate-400 font-medium">
            AS SIDRAT — Premium PDF Invoice generated by <strong className="text-slate-500">@react-pdf/renderer</strong>
          </p>
          <p className="text-[9px] text-slate-400 font-mono">
            v{new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
