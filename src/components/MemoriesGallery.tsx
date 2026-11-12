import React from 'react';
import { Heart, Search, Plus, ArrowUpDown, Expand, Trash2, Camera } from 'lucide-react';
import {
  MemoryItem,
  formatArabicDate,
} from '../utils/memoriesLogic';
import { ResilientImage } from './ResilientImage';

interface MemoriesGalleryProps {
  memories: MemoryItem[];
  canEdit?: boolean;
  activeFilter: 'all' | 'favorites';
  searchQuery: string;
  sortOrder: 'newest' | 'oldest';
  onFilterChange: (filter: 'all' | 'favorites') => void;
  onSearchChange: (q: string) => void;
  onToggleSort: () => void;
  onToggleFavorite: (id: string) => void;
  onSelectMemory: (memory: MemoryItem) => void;
  onDeleteMemory?: (id: string) => void;
  onOpenAddMemory: () => void;
}

const PHOTO_TABS: Array<{ id: 'all' | 'favorites'; label: string }> = [
  { id: 'all', label: 'كل الصور' },
  { id: 'favorites', label: 'الصور المفضلة ❤️' },
];

export const MemoriesGallery: React.FC<MemoriesGalleryProps> = ({
  memories,
  canEdit = true,
  activeFilter,
  searchQuery,
  sortOrder,
  onFilterChange,
  onSearchChange,
  onToggleSort,
  onToggleFavorite,
  onSelectMemory,
  onDeleteMemory,
  onOpenAddMemory,
}) => {
  const handleDelete = (id: string, title: string) => {
    if (!onDeleteMemory) return;
    const confirmed = window.confirm(`هل أنت متأكد من حذف صورة "${title}" من الألبوم؟`);
    if (confirmed) {
      onDeleteMemory(id);
    }
  };

  return (
    <section id="gallery" className="relative z-10 py-16 sm:py-20 border-t border-[#3A1847]/40 bg-[#0E0614]/70">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs text-[#FFA5BA] mb-2 font-medium">
              ألبومنا المصور · كل الصور واللحظات الحلوة
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>ألبوم صورنا معاً</span>
              <Camera className="w-7 h-7 text-[#FF3366] inline-block" />
            </h2>
          </div>

          {canEdit && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onOpenAddMemory}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-[#FF3366] to-[#E11D48] hover:from-[#FF4D88] hover:to-[#F43F5E] rounded-xl shadow-[0_0_15px_rgba(255,51,102,0.4)] transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة صورة جديدة</span>
              </button>
            </div>
          )}
        </div>

        {/* Toolbar: Direct Photos Tabs, Search, Sort */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-10 pb-6 border-b border-[#2C1438]">
          {/* Simple Tab Controls: All Photos vs Favorites */}
          <div
            role="tablist"
            aria-label="عرض الصور"
            className="flex items-center gap-1.5 p-1.5 bg-[#170B1F] border border-[#3A1847] rounded-xl"
          >
            {PHOTO_TABS.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onFilterChange(tab.id)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#FF3366] text-white shadow-sm'
                      : 'text-[#D8B4D4] hover:text-white hover:bg-[#251032]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-[#A888A4] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                aria-label="ابحث في الصور"
                placeholder="ابحث بالعنوان أو المكان..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pr-9 pl-3 py-2 text-xs sm:text-sm bg-[#170B1F] border border-[#3A1847] rounded-xl text-white placeholder:text-[#8C6D88] focus:outline-none focus:border-[#FF3366]"
              />
            </div>

            <button
              type="button"
              onClick={onToggleSort}
              aria-label={
                sortOrder === 'newest'
                  ? 'ترتيب الصور: الأحدث أولاً'
                  : 'ترتيب الصور: الأقدم أولاً'
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#F3EBF5] bg-[#170B1F] border border-[#3A1847] hover:border-[#FF3366]/60 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#FF6699]" />
              <span>{sortOrder === 'newest' ? 'الأحدث أولاً' : 'الأقدم أولاً'}</span>
            </button>
          </div>
        </div>

        {/* Empty State */}
        {memories.length === 0 ? (
          <div className="py-16 px-6 text-center bg-[#150B1C]/80 rounded-2xl border border-[#3A1847]">
            <p className="text-xl font-bold text-white mb-2">
              لا توجد صور مطابقة لهذا البحث حالياً
            </p>
            <p className="text-xs sm:text-sm text-[#C5A5C2] mb-6 max-w-md mx-auto">
              يمكنك مسح البحث أو إضافة صور جديدة لألبوم ذكرياتكما معاً.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onFilterChange('all');
                  onSearchChange('');
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-[#251032] border border-[#3A1847] rounded-xl hover:bg-[#341646] transition-colors cursor-pointer"
              >
                عرض كل الصور
              </button>
              {canEdit && (
                <button
                  type="button"
                  onClick={onOpenAddMemory}
                  className="px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-[#FF3366] to-[#E11D48] rounded-xl transition-colors cursor-pointer"
                >
                  إضافة صورة جديدة
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Bento Photo Grid */
          <div
            data-testid="memories-grid"
            className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8"
          >
            {memories.map((memory, index) => {
              const isWide = index % 3 === 0;
              return (
                <article
                  key={memory.id}
                  className={`${
                    isWide ? 'md:col-span-7' : 'md:col-span-5'
                  } group flex flex-col justify-between bg-[#150A1C]/90 border border-[#3E1B4A] hover:border-[#FF3366]/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,51,102,0.2)]`}
                >
                  {/* Media Container */}
                  <div className="relative h-64 sm:h-80 w-full bg-[#1F0E26] overflow-hidden">
                    <ResilientImage
                      src={memory.imageUrl}
                      alt={memory.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Overlay Action Buttons */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      {/* Left: Favorite Button */}
                      <button
                        type="button"
                        onClick={() => onToggleFavorite(memory.id)}
                        aria-label={
                          memory.isFavorite
                            ? `إزالة "${memory.title}" من المفضلة`
                            : `إضافة "${memory.title}" إلى المفضلة`
                        }
                        className="pointer-events-auto w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer border border-white/10"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            memory.isFavorite
                              ? 'fill-[#FF3366] text-[#FF3366]'
                              : 'text-white'
                          }`}
                        />
                      </button>

                      {/* Right: Expand and Delete Actions */}
                      <div className="flex items-center gap-2 pointer-events-auto">
                        {canEdit && onDeleteMemory && (
                          <button
                            type="button"
                            onClick={() => handleDelete(memory.id, memory.title)}
                            aria-label={`مسح صورة "${memory.title}"`}
                            title="مسح الصورة من الألبوم"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#2D0D19]/90 hover:bg-[#4A1125] text-[#FF4D88] hover:text-white border border-[#FF3366]/40 text-xs font-semibold backdrop-blur-md transition-colors cursor-pointer shadow-md"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>مسح الصورة</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onSelectMemory(memory)}
                          aria-label={`عرض صورة "${memory.title}" بالحجم الكامل`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-medium hover:bg-black/80 transition-colors whitespace-nowrap shrink-0 cursor-pointer border border-white/10"
                        >
                          <Expand className="w-3.5 h-3.5 text-[#FFA5BA]" />
                          <span>عرض</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Clean Date & Location - No category pills */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#FFA5BA] mb-2 font-medium">
                        <span className="text-[#FFA5BA]">{formatArabicDate(memory.date)}</span>
                        <span aria-hidden="true" className="text-[#FF3366]/40">·</span>
                        <span className="text-[#C5A5C2]">{memory.location}</span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                        <button
                          type="button"
                          onClick={() => onSelectMemory(memory)}
                          className="text-right hover:text-[#FF6699] transition-colors cursor-pointer"
                        >
                          {memory.title}
                        </button>
                      </h3>

                      <p className="text-xs sm:text-sm leading-relaxed text-[#D8B4D4] line-clamp-3">
                        {memory.story}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[#2A1435] flex items-center justify-between text-xs text-[#A888A4]">
                      <span className="font-mono-num">{memory.date}</span>

                      <div className="flex items-center gap-4">
                        {canEdit && onDeleteMemory && (
                          <button
                            type="button"
                            onClick={() => handleDelete(memory.id, memory.title)}
                            className="font-medium text-[#FF4D88] hover:text-[#FF6699] flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>مسح الصورة</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onSelectMemory(memory)}
                          className="font-medium text-[#FF6699] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          قراءة التفاصيل
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
