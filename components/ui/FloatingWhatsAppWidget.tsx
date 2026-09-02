"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, X, Send, ShieldCheck, RefreshCw, ExternalLink, PhoneCall } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { cleanMarkdownArtifacts, getDirectImageLink } from '@/lib/utils';
import Link from 'next/link';

interface FloatingWhatsAppWidgetProps {
  whatsappNumber?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestedProducts?: any[];
}

export default function FloatingWhatsAppWidget({
  whatsappNumber: propWhatsappNumber,
}: FloatingWhatsAppWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { settings, fetchSettings } = useSettingsStore();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeWhatsappNumber = propWhatsappNumber || settings?.whatsappNumber || '+8801975745270';
  const cleanNumber = activeWhatsappNumber.replace(/[^0-9]/g, '');

  const defaultWelcome = settings?.aiWelcomeMessage || 'আসসালামু আলাইকুম! আস সিদরাহ্-তে আপনাকে স্বাগতম। আজ আপনাকে কীভাবে সাহায্য করতে পারি?';

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!settings) {
      fetchSettings();
    }
  }, [settings, fetchSettings]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { role: 'assistant', content: defaultWelcome }
      ]);
    }
  }, [defaultWelcome]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  const quickQueries = settings?.aiQuickQueries && settings.aiQuickQueries.length > 0
    ? settings.aiQuickQueries
    : [
        'আমি ক্যাশ অন ডেলিভারিতে অর্ডার করতে চাই।',
        'আপনাদের ডেলিভারি চার্জ ও সময় কত?',
        'নতুন প্রিমিয়াম শার্ট কালেকশন দেখতে চাই।'
      ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: query.trim() };
    const updatedHistory = [...messages, userMessage];

    setMessages(updatedHistory);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    // Add empty assistant response to stream into
    const assistantIndex = updatedHistory.length;
    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: '', suggestedProducts: [] }
    ]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory.map(m => ({ role: m.role, content: m.content })),
          stream: true
        })
      });

      if (!res.ok || !res.body) {
        throw new Error('Chat API network response was not ok');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;
          const jsonStr = trimmed.replace(/^data:\s*/, '');
          if (jsonStr === '[DONE]') continue;

          try {
            const data = JSON.parse(jsonStr);
            if (data.text) {
              streamText += data.text;
              const sanitizedStream = cleanMarkdownArtifacts(streamText);
              setMessages(prev => {
                const next = [...prev];
                if (next[assistantIndex]) {
                  next[assistantIndex] = {
                    ...next[assistantIndex],
                    content: sanitizedStream
                  };
                }
                return next;
              });
              setLoading(false);
            }

            if (data.done) {
              const finalContent = cleanMarkdownArtifacts(data.fullText || streamText);
              setMessages(prev => {
                const next = [...prev];
                if (next[assistantIndex]) {
                  next[assistantIndex] = {
                    role: 'assistant',
                    content: finalContent || 'আসসালামু আলাইকুম! আপনাকে কীভাবে সাহায্য করতে পারি?',
                    suggestedProducts: data.suggestedProducts || []
                  };
                }
                return next;
              });
            }
          } catch (err) {
            // Ignore parse errors on incomplete stream chunks
          }
        }
      }
    } catch (error) {
      console.error('AI Chat Streaming Error:', error);
      setMessages(prev => {
        const next = [...prev];
        if (next[assistantIndex]) {
          next[assistantIndex] = {
            role: 'assistant',
            content: 'দুঃখিত, সংযোগে সমস্যা হয়েছে। সরাসরি অফিশিয়াল হোয়াটসঅ্যাপে সাহায্য নিতে পারেন।'
          };
        }
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppRedirect = (customMsg?: string) => {
    const finalMsg = encodeURIComponent(customMsg || 'Hello AS SIDRAT, I need help with an order.');
    window.open(`https://wa.me/${cleanNumber}?text=${finalMsg}`, '_blank');
  };

  return (
    <div className="flex fixed bottom-20 right-4 md:bottom-5 md:right-5 z-40 md:z-50 flex-col items-end font-sans">
      {/* Expanded AI Chat Widget */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-stone-950 border border-stone-800 text-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 flex flex-col h-[520px]">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 p-4 text-white flex items-center justify-between border-b border-emerald-700/40 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-emerald-950 border-2 border-emerald-400 flex items-center justify-center font-bold text-sm shadow-md text-emerald-300">
                <Bot size={20} />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-stone-900 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-sm leading-tight">AS SIDRAT AI</h4>
                  <span className="bg-emerald-400/20 text-emerald-300 text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-emerald-400/30 flex items-center gap-0.5">
                    <Sparkles size={9} /> AI Care
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-200 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>অনলাইনে আছেন • Real-time Reply</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages([{ role: 'assistant', content: defaultWelcome }])}
                className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title="Restart Chat"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 font-bengali text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-sm'
                      : 'bg-stone-900 text-stone-200 border border-stone-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  {cleanMarkdownArtifacts(msg.content)}
                  {msg.role === 'assistant' && !msg.content && loading && (
                    <span className="inline-block w-1.5 h-3.5 bg-emerald-400 animate-pulse ml-0.5" />
                  )}
                </div>

                {/* Render Suggested Products Cards */}
                {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                  <div className="mt-2 space-y-1.5 w-full max-w-[85%]">
                    <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">সুপারিশকৃত প্রোডাক্ট:</span>
                    {msg.suggestedProducts.map((p: any, pIdx: number) => (
                      <Link
                        key={pIdx}
                        href={`/product/${p.slug}`}
                        target="_blank"
                        className="bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-emerald-600/60 p-2 rounded-xl flex items-center gap-2.5 transition-all group"
                      >
                        {p.image && (
                          <img src={getDirectImageLink(p.image)} alt={p.title} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-[11px] truncate group-hover:text-emerald-400 transition-colors">
                            {p.title}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-400 font-extrabold text-[11px]">৳{p.price}</span>
                            {p.originalPrice > p.price && (
                              <span className="text-stone-500 line-through text-[10px]">৳{p.originalPrice}</span>
                            )}
                          </div>
                        </div>
                        <ExternalLink size={12} className="text-stone-500 group-hover:text-emerald-400 transition-colors shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 p-3 rounded-2xl text-stone-400 w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] font-medium">AS SIDRAT AI লিখছে...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Queries Chips */}
          <div className="px-3 py-2 border-t border-stone-900 bg-stone-950/80 space-y-1.5">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block px-1">
              দ্রুত প্রশ্নসমূহ:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {quickQueries.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(query)}
                  className="bg-stone-900 hover:bg-emerald-950/80 border border-stone-800 hover:border-emerald-700/50 px-2.5 py-1.5 rounded-xl text-stone-300 hover:text-emerald-300 transition-all text-[11px] whitespace-nowrap shrink-0 font-bengali"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>

          {/* Input & WhatsApp Handover */}
          <div className="p-3 bg-stone-950 border-t border-stone-900 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="আপনার প্রশ্নটি এখানে লিখুন..."
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-600 font-sans"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={loading || !inputMessage.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                <Send size={15} />
              </button>
            </div>

            {/* Human Handover Button */}
            <div className="flex items-center justify-between pt-1 border-t border-stone-900 text-[10px]">
              <button
                onClick={() => handleWhatsAppRedirect()}
                className="text-emerald-400 hover:underline font-bold flex items-center gap-1"
              >
                <PhoneCall size={11} />
                <span>মানবের সাথে কথা বলবেন? WhatsApp</span>
              </button>
              <div className="flex items-center gap-1 text-stone-500 font-sans">
                <ShieldCheck size={11} className="text-emerald-500" />
                <span>100% AS SIDRAT AI Care</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 rounded-full shadow-2xl border-2 border-emerald-400/40 flex items-center justify-center transition-all duration-300 active:scale-95"
        aria-label="Open AS SIDRAT AI Assistant"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-stone-900 rounded-full animate-ping" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-stone-900 rounded-full" />
        <Bot size={24} className="text-white" />
        <span className="hidden sm:inline-block max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-2 text-xs font-bold transition-all duration-300">
          AS SIDRAT AI
        </span>
      </button>
    </div>
  );
}
