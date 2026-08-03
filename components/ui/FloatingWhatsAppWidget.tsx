"use client";

import React, { useState } from 'react';
import { MessageSquare, X, Send, ShieldCheck, Clock } from 'lucide-react';

interface FloatingWhatsAppWidgetProps {
  whatsappNumber?: string;
}

export default function FloatingWhatsAppWidget({
  whatsappNumber = '+8801733919156',
}: FloatingWhatsAppWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');

  const quickQueries = [
    'আমি ক্যাশ অন ডেলিভারিতে অর্ডার করতে চাই।',
    'আমার সাইজ নির্বাচন করতে সাহায্য দরকার।',
    'অর্ডারের ডেলিভারি সময় জানতে চাই।',
  ];

  const handleSend = (textToSend?: string) => {
    const finalMsg = encodeURIComponent(textToSend || message || 'Hello AS SIDRAT, I need help with an order.');
    window.open(`https://wa.me/${cleanNumber}?text=${finalMsg}`, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="hidden md:flex fixed bottom-5 right-5 z-50 flex-col items-end">
      {/* Expanded WhatsApp Quick Chat Card */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-88 bg-stone-950 border border-stone-800 text-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-emerald-900 border-2 border-emerald-400 flex items-center justify-center font-bold text-sm">
                S
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-stone-900 rounded-full" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">AS SIDRAT Support</h4>
                <div className="flex items-center gap-1 text-[11px] text-emerald-200 mt-0.5">
                  <Clock size={11} />
                  <span>Replies in &lt; 5 minutes</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 font-bengali text-xs">
            <div className="bg-stone-900 p-3 rounded-xl border border-stone-800 text-stone-200">
              <p>আসসালামু আলাইকুম! AS SIDRAT কাস্টমার কেয়ারে স্বাগতম। কীভাবে সাহায্য করতে পারি?</p>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] text-stone-400 uppercase tracking-wider font-semibold">
                Quick Questions:
              </span>
              {quickQueries.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(query)}
                  className="w-full text-left bg-stone-900 hover:bg-emerald-950/60 border border-stone-800 hover:border-emerald-700/50 p-2 rounded-xl text-stone-300 hover:text-emerald-300 transition-all text-xs flex items-center justify-between group"
                >
                  <span>{query}</span>
                  <Send size={12} className="opacity-0 group-hover:opacity-100 text-emerald-400 transition-opacity" />
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-600 font-sans"
              />
              <button
                onClick={() => handleSend()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl transition-colors"
              >
                <Send size={15} />
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-500 pt-1 border-t border-stone-900 font-sans">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span>100% Direct Official WhatsApp Support</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 rounded-full shadow-2xl border-2 border-emerald-400/40 flex items-center justify-center transition-all duration-300 active:scale-95"
        aria-label="Open WhatsApp Support Chat"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-stone-900 rounded-full animate-ping" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-stone-900 rounded-full" />
        <MessageSquare size={24} className="fill-white/20" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-2 text-xs font-bold transition-all duration-300">
          WhatsApp Support
        </span>
      </button>
    </div>
  );
}
