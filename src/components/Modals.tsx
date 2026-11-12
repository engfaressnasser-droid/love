import React, { useState, useEffect } from 'react';
import { X, Upload, Heart, Trash2, Calendar, Sparkles } from 'lucide-react';
import {
  MemoryItem,
  MemoryCategory,
  CoupleProfile,
  LoveLetter,
  PRESET_PHOTOS,
  validateMemoryInput,
  validateLetterInput,
  formatArabicDate,
} from '../utils/memoriesLogic';
import { ResilientImage } from './ResilientImage';
import { optimizeImage } from '../utils/imageOptimizer';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memory: Omit<MemoryItem, 'id'>) => void;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2024-05-21');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<MemoryCategory>('special_dates');
  const [story, setStory] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_PHOTOS[0].url);
  const [isFavorite, setIsFavorite] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const optimized = await optimizeImage(file);
      if (optimized) {
        setImageUrl(optimized);
      }
    } catch (err) {
      console.error('Error optimizing image:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateMemoryInput({ title, date, location, story });
    if (!validation.valid) {
      setErrors(validation.errors as Record<string, string>);
      return;
    }

    onSave({
      title: title.trim(),
      date: date.trim(),
      location: location.trim(),
      category,
      story: story.trim(),
      imageUrl,
      isFavorite,
      featuredSpan: 'standard',
    });

    setTitle('');
    setLocation('');
    setStory('');
    setErrors({});
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-memory-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-[#170B1F] border border-[#441E53] rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl my-8 text-white">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#32153F] mb-6">
          <h2
            id="add-memory-modal-title"
            className="text-2xl font-bold text-white flex items-center gap-2"
          >
            <span>إضافة ذكرى وصورة جديدة</span>
            <span>📸</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق نافذة إضافة ذكرى"
            className="p-2 rounded-lg text-[#C5A5C2] hover:text-white hover:bg-[#2A1238] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="memory-title-input"
              className="block text-xs font-medium text-[#FFA5BA] mb-1.5"
            >
              عنوان الذكرى
            </label>
            <input
              id="memory-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: تمشية على شاطئ البحر عند الغروب"
              className="w-full px-3.5 py-2.5 text-sm bg-[#12071A] border border-[#3A1847] rounded-xl text-white focus:outline-none focus:border-[#FF3366]"
            />
            {errors.title && (
              <p role="alert" className="text-xs text-[#FF4D88] mt-1">
                {errors.title}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="memory-date-input"
                className="block text-xs font-medium text-[#FFA5BA] mb-1.5"
              >
                تاريخ اللحظة
              </label>
              <input
                id="memory-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-mono-num bg-[#12071A] border border-[#3A1847] rounded-xl text-white focus:outline-none focus:border-[#FF3366]"
              />
              {errors.date && (
                <p role="alert" className="text-xs text-[#FF4D88] mt-1">
                  {errors.date}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="memory-location-input"
                className="block text-xs font-medium text-[#FFA5BA] mb-1.5"
              >
                المكان
              </label>
              <input
                id="memory-location-input"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="مثال: الإسكندرية · شاطئ ستانلي"
                className="w-full px-3.5 py-2.5 text-sm bg-[#12071A] border border-[#3A1847] rounded-xl text-white focus:outline-none focus:border-[#FF3366]"
              />
              {errors.location && (
                <p role="alert" className="text-xs text-[#FF4D88] mt-1">
                  {errors.location}
                </p>
              )}
            </div>
          </div>

          {/* Preset Photo or Upload */}
          <div>
            <span className="block text-xs font-medium text-[#FFA5BA] mb-1.5">
              صورة الذكرى
            </span>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-[#251032] border border-[#3A1847] hover:border-[#FF3366] rounded-xl cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-[#FF3366]" />
                <span>رفع صورة من جهازك</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {PRESET_PHOTOS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      imageUrl === preset.url
                        ? 'bg-[#FF3366] text-white border-[#FF3366]'
                        : 'bg-[#12071A] text-[#C5A5C2] border-[#3A1847] hover:border-[#FF3366]/40'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="memory-story-input"
              className="block text-xs font-medium text-[#FFA5BA] mb-1.5"
            >
              قصة هذه الذكرى
            </label>
            <textarea
              id="memory-story-input"
              rows={3}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="اكتب ما شعرت به في تلك اللحظة أو تفاصيلها الحلوة..."
              className="w-full px-3.5 py-2.5 text-sm bg-[#12071A] border border-[#3A1847] rounded-xl text-white focus:outline-none focus:border-[#FF3366]"
            />
            {errors.story && (
              <p role="alert" className="text-xs text-[#FF4D88] mt-1">
                {errors.story}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="memory-favorite-checkbox"
              type="checkbox"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              className="w-4 h-4 accent-[#FF3366] rounded"
            />
            <label
              htmlFor="memory-favorite-checkbox"
              className="text-xs text-[#EAD5E8] cursor-pointer"
            >
              إضافة هذه اللحظة إلى قائمة الذكريات المفضلة ❤️
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#32153F]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#C5A5C2] bg-[#1F0E2A] border border-[#3A1847] rounded-xl cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-gradient-to-r from-[#FF3366] to-[#E11D48] hover:from-[#FF4D88] hover:to-[#F43F5E] rounded-xl transition-all cursor-pointer"
            >
              حفظ الذكرى في الألبوم
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface LightboxModalProps {
  memory: MemoryItem | null;
  canEdit?: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onDeleteMemory: (id: string) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  memory,
  canEdit = true,
  onClose,
  onToggleFavorite,
  onDeleteMemory,
}) => {
  useEffect(() => {
    if (!memory) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [memory, onClose]);

  if (!memory) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-memory-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="bg-[#150A1C] rounded-2xl max-w-4xl w-full overflow-hidden border border-[#3E1B4A] shadow-2xl grid grid-cols-1 lg:grid-cols-12 text-white">
        {/* Image Container */}
        <div className="lg:col-span-7 bg-black flex items-center justify-center min-h-[300px] sm:min-h-[440px]">
          <ResilientImage
            src={memory.imageUrl}
            alt={memory.title}
            className="w-full h-full max-h-[560px] object-cover"
          />
        </div>

        {/* Story Info */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#2C1438] mb-5">
              <div className="text-xs text-[#FFA5BA] font-medium">
                <span className="text-[#FFA5BA]">{formatArabicDate(memory.date)}</span>
                <span aria-hidden="true" className="text-[#FF3366]/40"> · </span>
                <span className="text-[#C5A5C2]">{memory.location}</span>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="إغلاق عرض الذكرى"
                className="p-1.5 rounded-lg text-[#C5A5C2] hover:text-white hover:bg-[#2A1238] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2
              id="lightbox-memory-title"
              className="text-2xl sm:text-3xl font-extrabold text-white mb-2"
            >
              {memory.title}
            </h2>

            <div className="text-xs text-[#C5A5C2] mb-5">
              المكان: <span className="text-white">{memory.location}</span>
            </div>

            <p className="text-sm leading-relaxed text-[#D8B4D4] whitespace-pre-line">
              {memory.story}
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-[#2C1438] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onToggleFavorite(memory.id)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-[#251032] border border-[#3E1B4A] hover:border-[#FF3366] rounded-xl transition-colors cursor-pointer"
            >
              <Heart
                className={`w-4 h-4 ${
                  memory.isFavorite ? 'fill-[#FF3366] text-[#FF3366]' : 'text-[#C5A5C2]'
                }`}
              />
              <span>{memory.isFavorite ? 'في المفضلة' : 'إضافة للمفضلة'}</span>
            </button>

            <div className="flex items-center gap-2">
              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    const confirmed = window.confirm(`هل أنت متأكد من حذف صورة "${memory.title}" نهائياً من الألبوم؟`);
                    if (confirmed) {
                      onDeleteMemory(memory.id);
                      onClose();
                    }
                  }}
                  aria-label={`مسح صورة "${memory.title}"`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#FF4D88] hover:text-white bg-[#2E0F1D] hover:bg-[#4A1125] border border-[#FF3366]/40 rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>مسح الصورة</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-white bg-[#331742] hover:bg-[#431E56] rounded-xl transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface EditDatesModalProps {
  isOpen: boolean;
  profile: CoupleProfile;
  onClose: () => void;
  onSaveProfile: (updated: CoupleProfile) => void;
}

export const EditDatesModal: React.FC<EditDatesModalProps> = ({
  isOpen,
  profile,
  onClose,
  onSaveProfile,
}) => {
  const [partnerOneName, setPartnerOneName] = useState(profile.partnerOneName);
  const [partnerTwoName, setPartnerTwoName] = useState(profile.partnerTwoName);
  const [startDate, setStartDate] = useState(profile.startDate);
  const [firstMetLabel, setFirstMetLabel] = useState(profile.firstMetLabel);
  const [romanticTagline, setRomanticTagline] = useState(profile.romanticTagline);

  useEffect(() => {
    if (isOpen) {
      setPartnerOneName(profile.partnerOneName);
      setPartnerTwoName(profile.partnerTwoName);
      setStartDate(profile.startDate);
      setFirstMetLabel(profile.firstMetLabel);
      setRomanticTagline(profile.romanticTagline);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...profile,
      partnerOneName: partnerOneName.trim() || profile.partnerOneName,
      partnerTwoName: partnerTwoName.trim() || profile.partnerTwoName,
      startDate: startDate.trim() || profile.startDate,
      firstMetLabel: firstMetLabel.trim() || profile.firstMetLabel,
      romanticTagline: romanticTagline.trim() || profile.romanticTagline,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-dates-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-[#170B1F] border border-[#441E53] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl my-8 text-white">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#32153F] mb-6">
          <h2
            id="edit-dates-modal-title"
            className="text-2xl font-bold text-white flex items-center gap-2"
          >
            <span>تعديل الأسماء وتاريخ البداية</span>
            <span>❤️</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق نافذة التعديل"
            className="p-2 rounded-lg text-[#C5A5C2] hover:text-white hover:bg-[#2A1238] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="edit-partner1-input"
                className="block text-xs font-medium text-[#FFA5BA] mb-1.5"
              >
                اسمك
              </label>
              <input
                id="edit-partner1-input"
                type="text"
                value={partnerOneName}
                onChange={(e) => setPartnerOneName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#12071A] border border-[#3A1847] rounded-xl text-white focus:outline-none focus:border-[#FF3366]"
              />
            </div>

            <div>
              <label
                htmlFor="edit-partner2-input"
                className="block text-xs font-medium text-[#FFA5BA] mb-1.5"
              >
                اسم حبيبتك
              </label>
              <input
                id="edit-partner2-input"
                type="text"
                value={partnerTwoName}
                onChange={(e) => setPartnerTwoName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#12071A] border border-[#3A1847] rounded-xl text-white focus:outline-none focus:border-[#FF3366]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="edit-anniversary-input"
              className="block text-xs font-medium text-[#FFA5BA] mb-1.5"
            >
              تاريخ بداية حبنا / أول لقاء (لحساب عداد أيام العشق والذكرى السنوية)
            </label>
            <input
              id="edit-anniversary-input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-mono-num bg-[#12071A] border border-[#3A1847] rounded-xl text-white focus:outline-none focus:border-[#FF3366]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="edit-met-label"
                className="block text-xs font-medium text-[#FFA5BA] mb-1.5"
              >
                وصف يوم اللقاء
              </label>
              <input
                id="edit-met-label"
                type="text"
                value={firstMetLabel}
                onChange={(e) => setFirstMetLabel(e.target.value)}
                placeholder="مثال: أول يوم جمعنا"
                className="w-full px-3 py-2 text-xs bg-[#12071A] border border-[#3A1847] rounded-xl text-white"
              />
            </div>

            <div>
              <label
                htmlFor="edit-tagline-label"
                className="block text-xs font-medium text-[#FFA5BA] mb-1.5"
              >
                شعار حكايتنا
              </label>
              <input
                id="edit-tagline-label"
                type="text"
                value={romanticTagline}
                onChange={(e) => setRomanticTagline(e.target.value)}
                placeholder="مثال: حكايتنا الحلوة"
                className="w-full px-3 py-2 text-xs bg-[#12071A] border border-[#3A1847] rounded-xl text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#32153F]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#C5A5C2] bg-[#1F0E2A] border border-[#3A1847] rounded-xl cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-gradient-to-r from-[#FF3366] to-[#E11D48] hover:from-[#FF4D88] hover:to-[#F43F5E] rounded-xl transition-all cursor-pointer"
            >
              حفظ وتحديث العدادات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditHeroModalProps {
  isOpen: boolean;
  profile: CoupleProfile;
  onClose: () => void;
  onSaveProfile: (updated: CoupleProfile) => void;
}

export const EditHeroModal: React.FC<EditHeroModalProps> = ({
  isOpen,
  profile,
  onClose,
  onSaveProfile,
}) => {
  const [heroTitle, setHeroTitle] = useState(profile.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(profile.heroSubtitle);
  const [songTitle, setSongTitle] = useState(profile.songTitle);

  useEffect(() => {
    if (isOpen) {
      setHeroTitle(profile.heroTitle);
      setHeroSubtitle(profile.heroSubtitle);
      setSongTitle(profile.songTitle);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...profile,
      heroTitle: heroTitle.trim() || profile.heroTitle,
      heroSubtitle: heroSubtitle.trim() || profile.heroSubtitle,
      songTitle: songTitle.trim() || profile.songTitle,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-hero-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-[#170B1F] border border-[#441E53] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl my-8 text-white">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#32153F] mb-6">
          <h2
            id="edit-hero-modal-title"
            className="text-2xl font-bold text-white flex items-center gap-2"
          >
            <span>تعديل رسالة وعنوان الواجهة</span>
            <span>✨</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق نافذة تعديل الواجهة"
            className="p-2 rounded-lg text-[#C5A5C2] hover:text-white hover:bg-[#2A1238] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="edit-hero-title-input"
              className="block text-xs font-medium text-[#FFA5BA] mb-1.5"
            >
              العنوان النيوني الكبير في الواجهة
            </label>
            <textarea
              id="edit-hero-title-input"
              rows={3}
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#12071A] border border-[#3A1847] rounded-xl text-white focus:outline-none focus:border-[#FF3366]"
            />
          </div>

          <div>
            <label
              htmlFor="edit-hero-sub-input"
              className="block text-xs font-medium text-[#FFA5BA] mb-1.5"
            >
              الرسالة الرومانسية تحت العنوان
            </label>
            <textarea
              id="edit-hero-sub-input"
              rows={3}
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#12071A] border border-[#3A1847] rounded-xl text-white focus:outline-none focus:border-[#FF3366]"
            />
          </div>

          <div>
            <label
              htmlFor="edit-song-title-input"
              className="block text-xs font-medium text-[#FFA5BA] mb-1.5"
            >
              اسم الأغنية أو اللحن الهادئ
            </label>
            <input
              id="edit-song-title-input"
              type="text"
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#12071A] border border-[#3A1847] rounded-xl text-white focus:outline-none focus:border-[#FF3366]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#32153F]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#C5A5C2] bg-[#1F0E2A] border border-[#3A1847] rounded-xl cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-gradient-to-r from-[#FF3366] to-[#E11D48] hover:from-[#FF4D88] hover:to-[#F43F5E] rounded-xl transition-all cursor-pointer"
            >
              حفظ التعديلات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface LetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLetter: (letter: Omit<LoveLetter, 'id'>) => void;
}

export const LetterModal: React.FC<LetterModalProps> = ({
  isOpen,
  onClose,
  onSaveLetter,
}) => {
  const [title, setTitle] = useState('');
  const [occasion, setOccasion] = useState('رسالة من القلب');
  const [date, setDate] = useState('2026-11-02');
  const [content, setContent] = useState('');
  const [signature, setSignature] = useState('محبكِ دائماً');
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  useEffect(() => {
    if (isOpen) {
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateLetterInput({ title, content });
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    onSaveLetter({
      title: title.trim(),
      occasion: occasion.trim() || 'رسالة خاصة',
      date: date.trim() || '2026-11-02',
      content: content.trim(),
      signature: signature.trim() || 'محبكِ',
      isPinned: true,
    });
    setTitle('');
    setContent('');
    setErrors({});
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-letter-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-[#170B1F] border border-[#441E53] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl my-8 text-white">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#32153F] mb-6">
          <h2
            id="add-letter-modal-title"
            className="text-2xl font-bold text-white flex items-center gap-2"
          >
            <span>كتابة رسالة حب جديدة</span>
            <span>💌</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق نافذة الرسالة"
            className="p-2 rounded-lg text-[#C5A5C2] hover:text-white hover:bg-[#2A1238] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="letter-title-input"
              className="block text-xs font-medium text-[#FFA5BA] mb-1.5"
            >
              عنوان الرسالة
            </label>
            <input
              id="letter-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: إلى أجمل صدفة في عمري"
              className="w-full px-3.5 py-2 text-sm bg-[#12071A] border border-[#3A1847] rounded-xl text-white"
            />
            {errors.title && (
              <p role="alert" className="text-xs text-[#FF4D88] mt-1">
                {errors.title}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="letter-occasion-input"
                className="block text-xs font-medium text-[#FFA5BA] mb-1.5"
              >
                المناسبة
              </label>
              <input
                id="letter-occasion-input"
                type="text"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[#12071A] border border-[#3A1847] rounded-xl text-white"
              />
            </div>

            <div>
              <label
                htmlFor="letter-signature-input"
                className="block text-xs font-medium text-[#FFA5BA] mb-1.5"
              >
                التوقيع
              </label>
              <input
                id="letter-signature-input"
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[#12071A] border border-[#3A1847] rounded-xl text-white"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="letter-content-input"
              className="block text-xs font-medium text-[#FFA5BA] mb-1.5"
            >
              نص الرسالة
            </label>
            <textarea
              id="letter-content-input"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب مشاعرك ووعودك لها..."
              className="w-full px-3.5 py-2 text-sm bg-[#12071A] border border-[#3A1847] rounded-xl text-white"
            />
            {errors.content && (
              <p role="alert" className="text-xs text-[#FF4D88] mt-1">
                {errors.content}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#32153F]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#C5A5C2] bg-[#1F0E2A] border border-[#3A1847] rounded-xl cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-gradient-to-r from-[#FF3366] to-[#E11D48] hover:from-[#FF4D88] hover:to-[#F43F5E] rounded-xl transition-all cursor-pointer"
            >
              حفظ الرسالة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
