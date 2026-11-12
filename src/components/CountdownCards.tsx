import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, Calendar, Edit2, Flame } from 'lucide-react';
import {
  CoupleProfile,
  calculateNextAnniversaryCountdown,
  calculateRelationshipLiveDuration,
  formatArabicDate,
} from '../utils/memoriesLogic';

interface CountdownCardsProps {
  profile: CoupleProfile;
  canEdit?: boolean;
  onOpenEditDates: () => void;
}

export const CountdownCards: React.FC<CountdownCardsProps> = ({
  profile,
  canEdit = true,
  onOpenEditDates,
}) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loveDuration = calculateRelationshipLiveDuration(profile.startDate, now);
  const anniversaryCountdown = calculateNextAnniversaryCountdown(profile.startDate, now);

  const format2Digits = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Card 1 (Right in RTL): "بقالنا كام يوم بنحب بعض" */}
        <div
          data-testid="love-counter-card"
          className="relative rounded-2xl bg-[#140A1A]/85 border border-[#8C1D4F]/40 p-6 sm:p-7 backdrop-blur-md shadow-[0_0_30px_rgba(236,72,153,0.15)] flex flex-col justify-between"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#360D24] border border-[#FF3366]/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,51,102,0.3)]">
                <Heart className="w-6 h-6 fill-[#FF3366] text-[#FF3366]" />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  بقالنا كام يوم بنحب بعض
                </h2>
                <p className="text-xs sm:text-sm text-[#D8B4D4] mt-0.5">
                  من يوم ما نورتي حياتي ودنيتي كلها ❤️
                </p>
              </div>
            </div>

            <div>
              {canEdit ? (
                <button
                  type="button"
                  onClick={onOpenEditDates}
                  title="تعديل تاريخ بداية حبنا"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-[#FFA5BA] bg-[#2E0F23] border border-[#FF3366]/30 hover:border-[#FF3366] transition-colors cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#FF3366]" />
                  <span>{formatArabicDate(profile.startDate)}</span>
                  <Edit2 className="w-3 h-3 text-[#FF3366] opacity-70" />
                </button>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-[#FFA5BA] bg-[#2E0F23] border border-[#FF3366]/20">
                  <Calendar className="w-3.5 h-3.5 text-[#FF3366]" />
                  <span>{formatArabicDate(profile.startDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Big Highlight Number Banner */}
          <div className="bg-[#1D0C26]/90 border border-[#FF3366]/20 rounded-xl py-4 px-6 text-center mb-6">
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono-num text-4xl sm:text-5xl font-extrabold text-white">
                {loveDuration.totalDays}
              </span>
              <span className="text-base sm:text-lg font-bold text-[#FF6699] flex items-center gap-1.5">
                <span>يوم من العشق والغرام</span>
                <Flame className="w-4 h-4 fill-[#FF3366] text-[#FF3366]" />
              </span>
            </div>
          </div>

          {/* 4 Digital Timer Blocks */}
          <div className="grid grid-cols-4 gap-2.5 sm:gap-3 text-center">
            {/* Days */}
            <div className="bg-[#1C0D26] border border-[#3E1B4A] rounded-xl p-3">
              <div className="font-mono-num text-xl sm:text-2xl font-bold text-white">
                {loveDuration.days}
              </div>
              <div className="text-[11px] sm:text-xs text-[#C5A5C2] mt-0.5">أيام</div>
            </div>

            {/* Hours */}
            <div className="bg-[#1C0D26] border border-[#3E1B4A] rounded-xl p-3">
              <div className="font-mono-num text-xl sm:text-2xl font-bold text-white">
                {format2Digits(loveDuration.hours)}
              </div>
              <div className="text-[11px] sm:text-xs text-[#C5A5C2] mt-0.5">ساعات</div>
            </div>

            {/* Minutes */}
            <div className="bg-[#1C0D26] border border-[#3E1B4A] rounded-xl p-3">
              <div className="font-mono-num text-xl sm:text-2xl font-bold text-white">
                {format2Digits(loveDuration.minutes)}
              </div>
              <div className="text-[11px] sm:text-xs text-[#C5A5C2] mt-0.5">دقائق</div>
            </div>

            {/* Seconds (Glowing highlight block matching reference) */}
            <div className="bg-[#2B0E2A] border border-[#FF3366] rounded-xl p-3 shadow-[0_0_12px_rgba(255,51,102,0.35)]">
              <div className="font-mono-num text-xl sm:text-2xl font-extrabold text-[#FF4D88]">
                {format2Digits(loveDuration.seconds)}
              </div>
              <div className="text-[11px] sm:text-xs text-[#FFA5BA] font-medium mt-0.5">
                ثواني
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 (Left in RTL): "العد التنازلي لذكرى حبنا القادمة" */}
        <div
          data-testid="anniversary-countdown-card"
          className="relative rounded-2xl bg-[#140A1A]/85 border border-[#8C1D4F]/40 p-6 sm:p-7 backdrop-blur-md shadow-[0_0_30px_rgba(245,158,11,0.12)] flex flex-col justify-between"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#2F1F07] border border-[#F59E0B]/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <Sparkles className="w-6 h-6 text-[#F59E0B]" />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  العد التنازلي لذكرى حبنا القادمة
                </h2>
                <p className="text-xs sm:text-sm text-[#FDE68A]/80 mt-0.5">
                  فاضل قد إيه على احتفالنا بسنتنا الـ {anniversaryCountdown.yearsCompleted} سوا؟ ✨
                </p>
              </div>
            </div>

            <div>
              {canEdit ? (
                <button
                  type="button"
                  onClick={onOpenEditDates}
                  title="تعديل تاريخ الذكرى السنوية"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-num text-[#FDE68A] bg-[#2E200C] border border-[#F59E0B]/30 hover:border-[#F59E0B] transition-colors cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>الذكرى السنوية</span>
                  <Edit2 className="w-3 h-3 text-[#F59E0B] opacity-70" />
                </button>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-num text-[#FDE68A] bg-[#2E200C] border border-[#F59E0B]/20">
                  <Calendar className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>الذكرى السنوية</span>
                </div>
              )}
            </div>
          </div>

          {/* Big Highlight Number Banner */}
          <div className="bg-[#24170D]/90 border border-[#F59E0B]/25 rounded-xl py-4 px-6 text-center mb-6">
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono-num text-4xl sm:text-5xl font-extrabold text-white">
                {anniversaryCountdown.totalDays}
              </span>
              <span className="text-base sm:text-lg font-bold text-[#FBBF24] flex items-center gap-1">
                <span>يوم متبقي على ذكرى حبنا القادمة</span>
                <span>✨</span>
              </span>
            </div>
          </div>

          {/* 4 Digital Timer Blocks */}
          <div className="grid grid-cols-4 gap-2.5 sm:gap-3 text-center">
            {/* Days */}
            <div className="bg-[#1C0D26] border border-[#3E1B4A] rounded-xl p-3">
              <div className="font-mono-num text-xl sm:text-2xl font-bold text-white">
                {anniversaryCountdown.days}
              </div>
              <div className="text-[11px] sm:text-xs text-[#C5A5C2] mt-0.5">أيام</div>
            </div>

            {/* Hours */}
            <div className="bg-[#1C0D26] border border-[#3E1B4A] rounded-xl p-3">
              <div className="font-mono-num text-xl sm:text-2xl font-bold text-white">
                {format2Digits(anniversaryCountdown.hours)}
              </div>
              <div className="text-[11px] sm:text-xs text-[#C5A5C2] mt-0.5">ساعات</div>
            </div>

            {/* Minutes */}
            <div className="bg-[#1C0D26] border border-[#3E1B4A] rounded-xl p-3">
              <div className="font-mono-num text-xl sm:text-2xl font-bold text-white">
                {format2Digits(anniversaryCountdown.minutes)}
              </div>
              <div className="text-[11px] sm:text-xs text-[#C5A5C2] mt-0.5">دقائق</div>
            </div>

            {/* Seconds (Glowing highlight block matching reference) */}
            <div className="bg-[#2E1D0C] border border-[#F59E0B] rounded-xl p-3 shadow-[0_0_12px_rgba(245,158,11,0.35)]">
              <div className="font-mono-num text-xl sm:text-2xl font-extrabold text-[#FCD34D]">
                {format2Digits(anniversaryCountdown.seconds)}
              </div>
              <div className="text-[11px] sm:text-xs text-[#FDE68A] font-medium mt-0.5">
                ثواني
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
