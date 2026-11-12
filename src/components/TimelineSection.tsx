import React from 'react';
import {
  MemoryItem,
  formatArabicDate,
} from '../utils/memoriesLogic';

interface TimelineSectionProps {
  memories: MemoryItem[];
  onSelectMemory: (memory: MemoryItem) => void;
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({
  memories,
  onSelectMemory,
}) => {
  const chronological = [...memories].sort(
    (a, b) => (new Date(a.date).getTime() || 0) - (new Date(b.date).getTime() || 0)
  );

  return (
    <section id="timeline" className="relative z-10 py-16 sm:py-20 bg-[#0B0512] border-t border-[#3A1847]/40">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-xs text-[#FFA5BA] mb-2 font-medium">
              فصول حكايتنا · مرتبة منذ أول لقاء
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              خط الزمن لذكرياتنا الجميلة
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#D8B4D4] max-w-md">
            كل محطة هنا هي خطوة في حكايتنا التي بدأت بصدفة جميلة وتحولت إلى قصة حب لا تنتهي.
          </p>
        </div>

        <div className="divide-y divide-[#2C1438] border-t border-b border-[#2C1438]">
          {chronological.map((item, idx) => {
            const chapterNum = String(idx + 1).padStart(2, '0');
            return (
              <div
                key={item.id}
                className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
              >
                {/* Numbering & Date */}
                <div className="md:col-span-3">
                  <div className="text-sm font-bold text-[#FF6699] mb-1">
                    <span className="font-mono-num">{chapterNum}.</span> محطة في القصة
                  </div>
                  <div className="text-xs text-[#C5A5C2]">
                    <span>{formatArabicDate(item.date)}</span>
                    <span aria-hidden="true" className="text-[#FF3366]/40"> · </span>
                    <span>{item.location}</span>
                  </div>
                </div>

                {/* Title & Story */}
                <div className="md:col-span-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-[#D8B4D4] max-w-[65ch]">
                    {item.story}
                  </p>
                </div>

                {/* Action */}
                <div className="md:col-span-3 flex md:flex-row md:justify-end items-center">
                  <button
                    type="button"
                    onClick={() => onSelectMemory(item)}
                    className="px-4 py-2 text-xs font-medium text-white bg-[#1A0C22] border border-[#3E1B4A] hover:border-[#FF3366] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    مشاهدة الصورة
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
