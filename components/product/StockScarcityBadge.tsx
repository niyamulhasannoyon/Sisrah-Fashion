"use client";

import React, { useState, useEffect } from 'react';
import { Flame, Clock, Truck } from 'lucide-react';

interface StockScarcityBadgeProps {
  stock?: number;
}

export default function StockScarcityBadge({ stock = 5 }: StockScarcityBadgeProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 18, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 2, minutes: 30, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedHours = String(timeLeft.hours).padStart(2, '0');
  const formattedMinutes = String(timeLeft.minutes).padStart(2, '0');
  const formattedSeconds = String(timeLeft.seconds).padStart(2, '0');

  const isLowStock = stock <= 10;

  return (
    <div className="w-full bg-stone-900/80 border border-stone-800 rounded-xl p-3.5 space-y-2.5 my-3 text-stone-200">
      {/* Low Stock Scarcity Row */}
      {isLowStock && (
        <div className="flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Flame size={15} className="animate-bounce shrink-0" />
            <span>Limited Stock: Only {stock} items left in Dhaka warehouse!</span>
          </div>
          <span className="text-[11px] text-stone-400 font-mono">High Demand</span>
        </div>
      )}

      {/* Progress Bar showing items claimed */}
      {isLowStock && (
        <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-[#A31F24] h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(92, 100 - stock * 7)}%` }}
          />
        </div>
      )}

      {/* Dispatch Countdown Timer Row */}
      <div className="flex items-center justify-between text-xs text-stone-300 pt-0.5 border-t border-stone-800/80 font-bengali">
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-[#A31F24] shrink-0" />
          <span>আজকে শিপিং পেতে অর্ডার করুন:</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-xs font-bold text-white bg-stone-800 px-2 py-0.5 rounded border border-stone-700">
          <span>{formattedHours}h</span>:
          <span>{formattedMinutes}m</span>:
          <span className="text-[#A31F24]">{formattedSeconds}s</span>
        </div>
      </div>
    </div>
  );
}
