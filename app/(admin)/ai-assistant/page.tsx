'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, Sparkles, Save, Plus, Trash2, RefreshCw, Send, CheckCircle2,
  AlertCircle, HelpCircle, Shield, Sliders, MessageSquare, Key, Play, CornerDownLeft
} from 'lucide-react';
import { cleanMarkdownArtifacts, getDirectImageLink } from '@/lib/utils';

interface FAQ {
  question: string;
  answer: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestedProducts?: any[];
}

export default function AiAssistantPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'rules' | 'faqs' | 'settings'>('rules');

  // Form State
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiApiKey, setAiApiKey] = useState('v84Ftx7BcJBugkq0Cig51Kwcl2lYjWav');
  const [aiModel, setAiModel] = useState('gemini-2.0-flash');
  const [aiAssistantName, setAiAssistantName] = useState('AS SIDRAT AI Assistant');
  const [aiTone, setAiTone] = useState('Friendly, warm, polite Bengali');
  const [aiSystemPrompt, setAiSystemPrompt] = useState(
    `Role: You are the real-time customer support chat agent for the Bangladeshi clothing brand "AS SIDRAT" (assidrat.vercel.app).

Tone and Personality:
- Friendly, warm, polite, and natural—like talking to a helpful Bangladeshi store representative.
- Reply in Bengali by default, or match the user's language (Banglish/English).
- Keep replies brief and conversational (1-2 sentences maximum).

Strict Formatting Rules:
- NEVER use markdown symbols (*, **, _, #, -, etc.).
- Output ONLY plain text with normal spacing and line breaks.

Knowledge Base:
- Products: Premium linen shirts, pure combed cotton t-shirts.
- Delivery Charge and Time: Inside Dhaka 80 TK (2-3 business days), Outside Dhaka 120 TK (3-5 business days).
- Return and Exchange: 7-day hassle-free exchange for unused items with tags.
- Payment Methods: Cash on Delivery (COD), bKash, Nagad.
- WhatsApp Support: +880 1975745270.

Boundary:
- If asked about unrelated topics, politely guide them back to AS SIDRAT shopping.`
  );
  const [aiRules, setAiRules] = useState<string[]>([
    'সবসময় গ্রাহককে সালাম জানান এবং অত্যন্ত মার্জিত বাংলায় বিনয়ী হয়ে সাহায্য প্রদান করুন।',
    'ওয়েবসাইতের রিয়েল-টাইম প্রোডাক্ট প্রাইস, স্টক এবং সাইজ অনুযায়ী সঠিক তথ্য সরবরাহ করুন।',
    'সমগ্র বাংলাদেশে ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধা উপলব্ধ।',
    'ঢাকার ভেতরে ডেলিভারি চার্জ ৮০ টাকা (২-৩ দিন) এবং ঢাকার বাইরে ১২০ টাকা (৩-৫ দিন)।',
    'যেকোনো সাইজ এক্সচেঞ্জ বা রিটার্ন ৭ দিনের মধ্যে অক্ষত অবস্থায় গ্রহণ করা হয়।'
  ]);
  const [aiFaqs, setAiFaqs] = useState<FAQ[]>([
    { question: 'আপনাদের ডেলিভারি সময় কত দিন?', answer: 'ঢাকার ভেতরে সাধারণত ২-৩ কর্মদিবস এবং ঢাকার বাইরে ৩-৫ কর্মদিবসের মধ্যে ডেলিভারি সম্পন্ন হয়।' },
    { question: 'পেমেন্ট পদ্ধতি কি কি?', answer: 'আমরা ক্যাশ অন ডেলিভারি (COD), বিকাশ ও নগদ গ্রহণ করি।' },
    { question: 'সাইজ পরিবর্তন করা যাবে কি?', answer: 'হ্যাঁ, প্রোডাক্ট পাওয়ার ৭ দিনের মধ্যে অক্ষত অবস্থায় ফ্রি সাইজ এক্সচেঞ্জ করার সুবিধা রয়েছে।' }
  ]);
  const [aiWelcomeMessage, setAiWelcomeMessage] = useState(
    'আসসালামু আলাইকুম! আস সিদরাহ্-তে আপনাকে স্বাগতম। আজ আপনাকে কীভাবে সাহায্য করতে পারি?'
  );
  const [aiQuickQueries, setAiQuickQueries] = useState<string[]>([
    'আমি ক্যাশ অন ডেলিভারিতে অর্ডার করতে চাই।',
    'আপনাদের ডেলিভারি চার্জ ও সময় কত?',
    'নতুন প্রিমিয়াম শার্ট কালেকশন দেখতে চাই।'
  ]);

  // New Rule / FAQ inputs
  const [newRuleInput, setNewRuleInput] = useState('');
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [newQueryInput, setNewQueryInput] = useState('');
  const [showKey, setShowKey] = useState(false);

  // Sandbox State
  const [sandboxMessages, setSandboxMessages] = useState<Message[]>([
    { role: 'assistant', content: 'আসসালামু আলাইকুম! আমি AS SIDRAT AI Sandbox। আপনার সেট করা রুলস অনুযায়ী পরীক্ষা করার জন্য বার্তা লিখুন।' }
  ]);
  const [sandboxInput, setSandboxInput] = useState('');
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch Settings
  useEffect(() => {
    fetchAiSettings();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sandboxMessages, sandboxLoading]);

  const fetchAiSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ai-settings');
      const data = await res.json();
      if (data.success && data.aiSettings) {
        const s = data.aiSettings;
        setAiEnabled(s.aiEnabled ?? true);
        if (s.aiApiKey) setAiApiKey(s.aiApiKey);
        if (s.aiModel) setAiModel(s.aiModel);
        if (s.aiAssistantName) setAiAssistantName(s.aiAssistantName);
        if (s.aiTone) setAiTone(s.aiTone);
        if (s.aiSystemPrompt) setAiSystemPrompt(s.aiSystemPrompt);
        if (s.aiRules && Array.isArray(s.aiRules)) setAiRules(s.aiRules);
        if (s.aiFaqs && Array.isArray(s.aiFaqs)) setAiFaqs(s.aiFaqs);
        if (s.aiWelcomeMessage) setAiWelcomeMessage(s.aiWelcomeMessage);
        if (s.aiQuickQueries && Array.isArray(s.aiQuickQueries)) setAiQuickQueries(s.aiQuickQueries);
      }
    } catch (error) {
      console.error('Failed to load AI settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setSaveError('');

    try {
      const payload = {
        aiEnabled,
        aiApiKey,
        aiModel,
        aiAssistantName,
        aiTone,
        aiSystemPrompt,
        aiRules,
        aiFaqs,
        aiWelcomeMessage,
        aiQuickQueries,
      };

      const res = await fetch('/api/admin/ai-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setSaveError(data.error || 'Failed to save settings');
      }
    } catch (error: any) {
      setSaveError(error.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  // Rule Handlers
  const handleAddRule = () => {
    if (!newRuleInput.trim()) return;
    setAiRules(prev => [...prev, newRuleInput.trim()]);
    setNewRuleInput('');
  };

  const handleDeleteRule = (index: number) => {
    setAiRules(prev => prev.filter((_, i) => i !== index));
  };

  // FAQ Handlers
  const handleAddFaq = () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    setAiFaqs(prev => [...prev, { question: newFaqQ.trim(), answer: newFaqA.trim() }]);
    setNewFaqQ('');
    setNewFaqA('');
  };

  const handleDeleteFaq = (index: number) => {
    setAiFaqs(prev => prev.filter((_, i) => i !== index));
  };

  // Quick Query Handlers
  const handleAddQuery = () => {
    if (!newQueryInput.trim()) return;
    setAiQuickQueries(prev => [...prev, newQueryInput.trim()]);
    setNewQueryInput('');
  };

  const handleDeleteQuery = (index: number) => {
    setAiQuickQueries(prev => prev.filter((_, i) => i !== index));
  };

  // Live Sandbox Chat Tester
  const handleSendSandboxMessage = async (customText?: string) => {
    const textToSend = customText || sandboxInput;
    if (!textToSend.trim() || sandboxLoading) return;

    const userMsg: Message = { role: 'user', content: textToSend.trim() };
    const newHistory = [...sandboxMessages, userMsg];
    setSandboxMessages(newHistory);
    if (!customText) setSandboxInput('');
    setSandboxLoading(true);

    const assistantIndex = newHistory.length;
    setSandboxMessages(prev => [
      ...prev,
      { role: 'assistant', content: '', suggestedProducts: [] }
    ]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role, content: m.content })),
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
              const sanitized = cleanMarkdownArtifacts(streamText);
              setSandboxMessages(prev => {
                const next = [...prev];
                if (next[assistantIndex]) {
                  next[assistantIndex] = {
                    ...next[assistantIndex],
                    content: sanitized
                  };
                }
                return next;
              });
              setSandboxLoading(false);
            }

            if (data.done) {
              const finalContent = cleanMarkdownArtifacts(data.fullText || streamText);
              setSandboxMessages(prev => {
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
            // Ignore partial parse
          }
        }
      }
    } catch (error) {
      console.error('Sandbox Test Error:', error);
      setSandboxMessages(prev => {
        const next = [...prev];
        if (next[assistantIndex]) {
          next[assistantIndex] = {
            role: 'assistant',
            content: 'ত্রুটি দেখা দিয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
          };
        }
        return next;
      });
    } finally {
      setSandboxLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-[#A31F24] rounded-full animate-spin"></div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Loading AS SIDRAT AI Studio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/40 text-white font-bold">
            <Bot size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">AS SIDRAT AI Assistant</h1>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <Sparkles size={12} /> AI Powered
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              ট্রেনিং রুলস, সিস্টেম প্রম্পট এবং FAQ সেট করে আপনার কাস্টমার অ্যাসিস্ট্যান্টকে প্রফেশনালি ট্রেইন করান।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10 w-full md:w-auto justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/30 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save AI Settings'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>AS SIDRAT AI Assistant-এর নিয়মাবলী ও সেটিংস সফলভাবে সংরক্ষিত হয়েছে!</span>
        </div>
      )}

      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={18} className="text-red-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Main Grid: Left Controls (Tabs) & Right Sandbox Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column - Config Tabs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Navigation Tabs */}
          <div className="flex bg-slate-200/80 p-1.5 rounded-2xl gap-1">
            <button
              onClick={() => setActiveTab('rules')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'rules'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders size={15} />
              <span>Training & Rules</span>
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'faqs'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle size={15} />
              <span>FAQ Knowledgebase</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'settings'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Key size={15} />
              <span>API & Settings</span>
            </button>
          </div>

          {/* TAB 1: Rules & System Prompt */}
          {activeTab === 'rules' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Enable Switch Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800">Enable AS SIDRAT AI Assistant</h3>
                  <p className="text-xs text-slate-500 mt-0.5">ওয়েবসাইটে গ্রাহকদের সাথে কথা বলার জন্য AI অ্যাক্টিভ রাখুন</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiEnabled}
                    onChange={(e) => setAiEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                </label>
              </div>

              {/* System Prompt Customization */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    <Sparkles size={16} className="text-emerald-600" /> System Persona & Training Instructions
                  </h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  এখানে আপনি আপনার AI কে প্রফেশনালি ট্রেইন করতে পারেন। AI কীভাবে আচরণ করবে এবং কী ধরনের শব্দ ব্যবহার করবে তা লিখে দিন।
                </p>
                <textarea
                  rows={4}
                  value={aiSystemPrompt}
                  onChange={(e) => setAiSystemPrompt(e.target.value)}
                  placeholder="যেমন: আপনি AS SIDRAT-এর জন্য কাজ করছেন..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-sans leading-relaxed"
                />
              </div>

              {/* Business Rules Tag Manager */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    <Shield size={16} className="text-teal-600" /> Custom Business Rules & Policies
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400">{aiRules.length} Rules Active</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  নির্দিষ্ট কিছু শপ রুলস যোগ করুন। AI উত্তর দেওয়ার সময় এই নিয়মগুলো শতভাগ মেনে চলবে।
                </p>

                {/* Add Rule Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRuleInput}
                    onChange={(e) => setNewRuleInput(e.target.value)}
                    placeholder="যেমন: নতুন ডিসকাউন্ট কোড WELCOME10 গ্রাহকদের দিতে পারো"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddRule()}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  />
                  <button
                    onClick={handleAddRule}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Plus size={15} /> Add Rule
                  </button>
                </div>

                {/* Rules List */}
                <div className="space-y-2 pt-2">
                  {aiRules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-slate-50 border border-slate-200/80 p-3 rounded-xl hover:border-slate-300 transition-all text-xs text-slate-800"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="font-medium leading-relaxed">{rule}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteRule(idx)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Rule"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: FAQs Knowledge Base */}
          {activeTab === 'faqs' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                  <HelpCircle size={16} className="text-emerald-600" /> Frequently Asked Questions (FAQ)
                </h3>
                <p className="text-xs text-slate-500">
                  গ্রাহকদের বহুল জিজ্ঞাসিত প্রশ্ন ও সঠিক উত্তরগুলো যুক্ত করুন। AI সরাসরি এই প্রশ্নোত্তর থেকে তথ্য দেবে।
                </p>

                {/* New FAQ Form */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-slate-500">প্রশ্ন (Question)</label>
                    <input
                      type="text"
                      value={newFaqQ}
                      onChange={(e) => setNewFaqQ(e.target.value)}
                      placeholder="যেমন: আপনাদের ঢাকার ডেলিভারি চার্জ কত?"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase text-slate-500">উত্তর (Answer)</label>
                    <textarea
                      rows={2}
                      value={newFaqA}
                      onChange={(e) => setNewFaqA(e.target.value)}
                      placeholder="যেমন: ঢাকার ভেতরে ডেলিভারি চার্জ মাত্র ৭০ টাকা।"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 mt-1"
                    />
                  </div>
                  <button
                    onClick={handleAddFaq}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus size={15} /> Add FAQ Pair
                  </button>
                </div>

                {/* FAQ List */}
                <div className="space-y-3 pt-2">
                  {aiFaqs.map((faq, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs relative group">
                      <button
                        onClick={() => handleDeleteFaq(idx)}
                        className="absolute top-3 right-3 text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                      <h4 className="font-extrabold text-xs text-slate-900 pr-8">Q: {faq.question}</h4>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">A: {faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: API & Widget Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                  <Key size={16} className="text-emerald-600" /> API & AI Model Configurations
                </h3>

                {/* API Key */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    AI Service API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={aiApiKey}
                      onChange={(e) => setAiApiKey(e.target.value)}
                      placeholder="Enter API Key"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white transition-all pr-20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 hover:text-slate-800 uppercase"
                    >
                      {showKey ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Configured Default: v84Ftx7BcJBugkq0Cig51Kwcl2lYjWav</p>
                </div>

                {/* Model Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    AI Model Engine
                  </label>
                  <select
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  >
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash (Recommended - Ultra Fast & Real-time)</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Lightweight & Quick)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
                  </select>
                </div>

                {/* Assistant Display Name */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    AI Assistant Name
                  </label>
                  <input
                    type="text"
                    value={aiAssistantName}
                    onChange={(e) => setAiAssistantName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Tone */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Conversational Tone
                  </label>
                  <input
                    type="text"
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Welcome Message */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Widget Welcome Message
                  </label>
                  <input
                    type="text"
                    value={aiWelcomeMessage}
                    onChange={(e) => setAiWelcomeMessage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Quick Query Chips */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Quick Question Suggestions (Chips)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newQueryInput}
                      onChange={(e) => setNewQueryInput(e.target.value)}
                      placeholder="Add quick question..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddQuery()}
                    />
                    <button
                      onClick={handleAddQuery}
                      className="bg-slate-800 text-white text-xs px-3 py-2 rounded-xl font-bold"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {aiQuickQueries.map((q, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-full flex items-center gap-2"
                      >
                        {q}
                        <button onClick={() => handleDeleteQuery(idx)} className="text-slate-400 hover:text-red-600">
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Right Column - LIVE INTERACTIVE AI SANDBOX TESTER */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl text-white shadow-2xl overflow-hidden flex flex-col h-[640px]">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-4 border-b border-emerald-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-950 border-2 border-emerald-400 flex items-center justify-center font-bold text-sm text-emerald-300 shadow-inner">
                  <Bot size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm leading-tight">{aiAssistantName}</h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-200 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live Training Sandbox Tester</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSandboxMessages([{ role: 'assistant', content: 'আসসালামু আলাইকুম! আমি AS SIDRAT AI Sandbox। আপনার সেট করা রুলস অনুযায়ী বার্তা লিখুন।' }])}
                className="text-emerald-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors text-xs flex items-center gap-1 font-semibold"
                title="Reset Test Conversation"
              >
                <RefreshCw size={13} /> Clear
              </button>
            </div>

            {/* Sandbox Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs">
              {sandboxMessages.map((msg, i) => (
                <div
                  key={i}
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
                  </div>

                  {/* Render Suggested Products if any */}
                  {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                    <div className="mt-2 space-y-1.5 w-full max-w-[85%]">
                      {msg.suggestedProducts.map((prod: any, pIdx: number) => (
                        <div key={pIdx} className="bg-stone-900 border border-stone-800 p-2 rounded-xl flex items-center gap-2">
                          {prod.image && (
                            <img src={getDirectImageLink(prod.image)} alt={prod.title} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white text-[11px] truncate">{prod.title}</p>
                            <p className="text-emerald-400 font-extrabold text-[11px]">৳{prod.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {sandboxLoading && (
                <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 p-3 rounded-2xl text-stone-400 w-fit">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[11px] font-semibold">AS SIDRAT AI চিন্তা করছে...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Test Prompts */}
            <div className="px-4 py-2 border-t border-stone-900 bg-stone-950/60 flex items-center gap-1.5 overflow-x-auto text-[10px]">
              <span className="text-stone-500 font-bold uppercase shrink-0">Test Prompts:</span>
              <button
                onClick={() => handleSendSandboxMessage('শার্টের কালেকশন দেখাও')}
                className="bg-stone-900 hover:bg-stone-800 text-stone-300 px-2.5 py-1 rounded-full whitespace-nowrap border border-stone-800"
              >
                শার্ট কালেকশন?
              </button>
              <button
                onClick={() => handleSendSandboxMessage('ঢাকার বাইরের ডেলিভারি চার্জ কত?')}
                className="bg-stone-900 hover:bg-stone-800 text-stone-300 px-2.5 py-1 rounded-full whitespace-nowrap border border-stone-800"
              >
                ডেলিভারি চার্জ?
              </button>
            </div>

            {/* Input Footer */}
            <div className="p-3 border-t border-stone-900 bg-stone-950 flex items-center gap-2">
              <input
                type="text"
                value={sandboxInput}
                onChange={(e) => setSandboxInput(e.target.value)}
                placeholder="এখানে টেস্ট বার্তা লিখুন..."
                onKeyDown={(e) => e.key === 'Enter' && handleSendSandboxMessage()}
                className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-600"
              />
              <button
                onClick={() => handleSendSandboxMessage()}
                disabled={sandboxLoading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                <Send size={15} />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
