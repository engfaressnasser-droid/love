import React from 'react';
import { Feather, Heart, Trash2 } from 'lucide-react';
import { LoveLetter, formatArabicDate } from '../utils/memoriesLogic';

interface LoveLettersSectionProps {
  letters: LoveLetter[];
  partnerTwoName: string;
  canEdit?: boolean;
  onOpenAddLetter: () => void;
  onTogglePinLetter: (id: string) => void;
  onDeleteLetter: (id: string) => void;
}

export const LoveLettersSection: React.FC<LoveLettersSectionProps> = ({
  letters,
  partnerTwoName,
  canEdit = true,
  onOpenAddLetter,
  onTogglePinLetter,
  onDeleteLetter,
}) => {
  return (
    <section id="letters" className="relative z-10 py-16 sm:py-20 bg-[#0E0614]/80 border-t border-[#3A1847]/40">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-xs text-[#FFA5BA] mb-2 font-medium">
              دفتر الرسائل · كلمات مكتوبة لكِ وحدكِ
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              رسائل من القلب إلى {partnerTwoName}
            </h2>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={onOpenAddLetter}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-[#FF3366] to-[#E11D48] hover:from-[#FF4D88] hover:to-[#F43F5E] rounded-xl shadow-[0_0_15px_rgba(255,51,102,0.35)] transition-all cursor-pointer whitespace-nowrap self-start md:self-auto"
            >
              <Feather className="w-4 h-4" />
              <span>كتابة رسالة حب جديدة</span>
            </button>
          )}
        </div>

        <div
          data-testid="letters-grid"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
        >
          {letters.map((letter, idx) => {
            const numLabel = String(idx + 1).padStart(2, '0');
            return (
              <article
                key={letter.id}
                className="flex flex-col justify-between p-6 sm:p-7 bg-[#150A1C]/90 border border-[#3E1B4A] hover:border-[#FF3366]/40 rounded-2xl transition-all shadow-[0_0_20px_rgba(236,72,153,0.08)]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-[#FFA5BA] mb-4 font-medium">
                    <div>
                      <span className="font-mono-num">{numLabel}</span>
                      <span aria-hidden="true" className="text-[#FF3366]/40"> · </span>
                      <span>{letter.occasion}</span>
                      <span aria-hidden="true" className="text-[#FF3366]/40"> · </span>
                      <span className="text-[#C5A5C2]">{formatArabicDate(letter.date)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onTogglePinLetter(letter.id)}
                        aria-label={
                          letter.isPinned
                            ? `إلغاء تثبيت رسالة "${letter.title}"`
                            : `تثبيت رسالة "${letter.title}"`
                        }
                        className="p-1.5 rounded-lg text-[#C5A5C2] hover:text-[#FF3366] hover:bg-[#250F2E] transition-colors cursor-pointer"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            letter.isPinned ? 'fill-[#FF3366] text-[#FF3366]' : ''
                          }`}
                        />
                      </button>
                      {canEdit && letters.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteLetter(letter.id)}
                          aria-label={`حذف رسالة "${letter.title}"`}
                          className="p-1.5 rounded-lg text-[#A888A4] hover:text-[#F43F5E] hover:bg-[#2B0E1E] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                    {letter.title}
                  </h3>

                  <p className="text-xs sm:text-sm leading-[1.85] text-[#D8B4D4] whitespace-pre-line">
                    «{letter.content}»
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#2A1435] flex items-center justify-between text-xs text-[#A888A4]">
                  <span className="text-sm font-bold text-[#FFA5BA]">
                    — {letter.signature}
                  </span>
                  <span className="font-mono-num">{letter.date}</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
