import React, { useState } from 'react';
import { Sparkles, Heart, RefreshCw, Quote } from 'lucide-react';
import {
  DAILY_ROMANTIC_MESSAGES,
  pickRandomDailyMessage,
} from '../utils/memoriesLogic';

export const DailyMessageCard: React.FC = () => {
  // Automatically pick a random romantic message every time the user opens the site
  const [message, setMessage] = useState<string>(() =>
    pickRandomDailyMessage(DAILY_ROMANTIC_MESSAGES)
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleNewRandomMessage = () => {
    setIsAnimating(true);
    setLiked(false);
    setTimeout(() => {
      setMessage((prev) => pickRandomDailyMessage(DAILY_ROMANTIC_MESSAGES, prev));
      setIsAnimating(false);
    }, 180);
  };

  return (
    <div
      aria-label="رسالة اليوم"
      className="max-w-3xl mx-auto mb-8 sm:mb-10 px-2"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1D0B28]/95 via-[#15081E]/95 to-[#240B22]/95 border border-[#FF3366]/40 p-5 sm:p-7 shadow-[0_0_35px_rgba(255,51,102,0.18)] backdrop-blur-md">
        {/* Subtle decorative ambient glow */}
        <div className="pointer-events-none absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[#FF3366]/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-[#F59E0B]/10 blur-2xl" />

        {/* Header Row */}
        <div className="relative z-10 flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[#381642]/80">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2B0E30] border border-[#FF3366]/40 shadow-[0_0_15px_rgba(255,51,102,0.25)]">
            <Sparkles className="w-4 h-4 text-[#FBBF24] animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-[#FFD1DF]">
              رسالة اليوم لكِ
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLiked((prev) => !prev)}
              aria-label="أعجبتني رسالة اليوم"
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                liked
                  ? 'bg-[#FF3366]/20 border-[#FF3366] text-[#FF3366] shadow-[0_0_12px_rgba(255,51,102,0.4)]'
                  : 'bg-[#1F0B29] border-[#3C1A4B] text-[#C5A5C2] hover:text-white hover:border-[#FF3366]/50'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-[#FF3366]' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleNewRandomMessage}
              title="اختيار رسالة رومانسية عشوائية أخرى"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1F0B29] hover:bg-[#2E113D] border border-[#3C1A4B] hover:border-[#FF3366]/50 text-xs font-medium text-[#E5C2E0] hover:text-white transition-all cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#FF3366] transition-transform duration-300 ${
                  isAnimating ? 'rotate-180' : ''
                }`}
              />
              <span>رسالة أخرى</span>
            </button>
          </div>
        </div>

        {/* Message Body */}
        <div className="relative z-10 flex items-center justify-center gap-3 py-2 px-2 sm:px-6">
          <Quote className="w-5 h-5 text-[#FF3366]/40 shrink-0 hidden sm:block rotate-180" />
          <p
            data-testid="daily-romantic-message"
            className={`text-base sm:text-xl md:text-2xl font-bold text-white leading-relaxed text-center transition-opacity duration-200 ${
              isAnimating ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {message}
          </p>
          <Quote className="w-5 h-5 text-[#FF3366]/40 shrink-0 hidden sm:block" />
        </div>
      </div>
    </div>
  );
};
