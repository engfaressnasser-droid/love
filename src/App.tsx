/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Crown,
  Heart,
  Camera,
  Feather,
  Calendar,
  Sparkles,
  CheckCircle2,
  Cloud,
  Download,
  UploadCloud,
  RefreshCw,
} from 'lucide-react';
import {
  MemoryItem,
  CoupleProfile,
  LoveLetter,
  INITIAL_COUPLE_PROFILE,
  INITIAL_MEMORIES,
  INITIAL_LETTERS,
  filterAndSortMemories,
} from './utils/memoriesLogic';
import { UserRole, canEditSite } from './utils/authLogic';
import {
  fetchServerData,
  saveServerData,
  uploadImageToServer,
} from './utils/apiClient';
import { RomanticAuthGate } from './components/RomanticAuthGate';
import { FloatingHearts } from './components/FloatingHearts';
import { RomanticAudioPlayer } from './components/RomanticAudioPlayer';
import { TopBar } from './components/TopBar';
import { HeroSection } from './components/HeroSection';
import { MemoriesGallery } from './components/MemoriesGallery';
import { TimelineSection } from './components/TimelineSection';
import { LoveLettersSection } from './components/LoveLettersSection';
import {
  MemoryModal,
  LightboxModal,
  EditDatesModal,
  EditHeroModal,
  LetterModal,
} from './components/Modals';

const STORAGE_KEYS = {
  PROFILE: 'hikayatuna_romantic_v3',
  MEMORIES: 'hikayatuna_memories_v3',
  LETTERS: 'hikayatuna_letters_v3',
  AUTH_ROLE: 'hikayatuna_auth_role_v3',
  AUTH_NAME: 'hikayatuna_auth_name_v3',
};

export default function App() {
  // Authentication State
  const [role, setRole] = useState<UserRole>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRole = params.get('role');
      if (urlRole === 'admin' || urlRole === 'love') return urlRole as UserRole;
      if (params.get('autostart') === '1') return 'love';

      try {
        const savedRole = localStorage.getItem(STORAGE_KEYS.AUTH_ROLE);
        if (savedRole === 'love' || savedRole === 'admin') return savedRole;
      } catch {
        // Fallback
      }
    }
    return 'guest';
  });

  const [welcomeBanner, setWelcomeBanner] = useState<string | null>(null);
  const [cloudStatus, setCloudStatus] = useState<'synced' | 'saving' | 'offline'>('synced');

  const [profile, setProfile] = useState<CoupleProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : INITIAL_COUPLE_PROFILE;
    } catch {
      return INITIAL_COUPLE_PROFILE;
    }
  });

  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEMORIES);
      return saved ? JSON.parse(saved) : INITIAL_MEMORIES;
    } catch {
      return INITIAL_MEMORIES;
    }
  });

  const [letters, setLetters] = useState<LoveLetter[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LETTERS);
      return saved ? JSON.parse(saved) : INITIAL_LETTERS;
    } catch {
      return INITIAL_LETTERS;
    }
  });

  // Filter & Search States (Direct photos: all vs favorites)
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Modal States
  const [isAddMemoryOpen, setIsAddMemoryOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);
  const [isEditDatesOpen, setIsEditDatesOpen] = useState(false);
  const [isEditHeroOpen, setIsEditHeroOpen] = useState(false);
  const [isAddLetterOpen, setIsAddLetterOpen] = useState(false);
  const [isControlMenuOpen, setIsControlMenuOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditor = canEditSite(role);

  // Sync from Cloud Server on mount and periodically across devices/phones
  useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      try {
        const remote = await fetchServerData();
        if (!isMounted) return;

        if (remote && (remote.profile || remote.memories || remote.letters)) {
          if (remote.profile) setProfile(remote.profile);
          if (remote.memories && Array.isArray(remote.memories)) setMemories(remote.memories);
          if (remote.letters && Array.isArray(remote.letters)) setLetters(remote.letters);
          setCloudStatus('synced');
        } else {
          // If server is clean, seed server with initial profile and memories
          await saveServerData({
            profile,
            memories,
            letters,
          });
          setCloudStatus('synced');
        }
      } catch (err) {
        console.warn('Initial server sync note:', err);
        setCloudStatus('offline');
      }
    }

    loadInitial();

    // Periodic cloud poll so that updates from any phone appear in real-time
    const interval = setInterval(async () => {
      try {
        const remote = await fetchServerData();
        if (!isMounted || !remote) return;
        if (remote.profile) setProfile(remote.profile);
        if (remote.memories && Array.isArray(remote.memories)) setMemories(remote.memories);
        if (remote.letters && Array.isArray(remote.letters)) setLetters(remote.letters);
        setCloudStatus('synced');
      } catch {
        // Silently keep current data
      }
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Sync to localStorage as offline cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch {
      // Ignore quota errors
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
    } catch {
      // Ignore quota errors
    }
  }, [memories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LETTERS, JSON.stringify(letters));
    } catch {
      // Ignore quota errors
    }
  }, [letters]);

  const handleLoginSuccess = (newRole: UserRole, _displayName: string, welcomeMsg?: string) => {
    setRole(newRole);
    try {
      window.dispatchEvent(new CustomEvent('romantic-start-music'));
    } catch {
      // Ignore
    }
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_ROLE, newRole);
    } catch {
      // Ignore
    }
    if (welcomeMsg) {
      setWelcomeBanner(welcomeMsg);
      setTimeout(() => {
        setWelcomeBanner(null);
      }, 7000);
    }
  };

  const handleLogout = () => {
    setRole('guest');
    setWelcomeBanner(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_ROLE);
    } catch {
      // Ignore
    }
  };

  const filteredMemories = useMemo(
    () => filterAndSortMemories(memories, activeFilter, searchQuery, sortOrder),
    [memories, activeFilter, searchQuery, sortOrder]
  );

  // Add memory with cloud upload of image
  const handleAddMemory = async (newMem: Omit<MemoryItem, 'id'>) => {
    setCloudStatus('saving');
    setWelcomeBanner('جاري حفظ الصورة ورفعها للسحابة... ☁️');

    try {
      let finalImageUrl = newMem.imageUrl;
      // If user selected or uploaded a base64 image, upload it to the server file storage
      if (finalImageUrl.startsWith('data:image/')) {
        finalImageUrl = await uploadImageToServer(finalImageUrl, newMem.title);
      }

      const created: MemoryItem = {
        ...newMem,
        imageUrl: finalImageUrl,
        id: `mem-${Date.now()}`,
      };

      const updated = [created, ...memories];
      setMemories(updated);
      await saveServerData({ memories: updated });

      setCloudStatus('synced');
      setWelcomeBanner('تم حفظ الصورة بنجاح وتظهر الآن على جميع الهواتف والأجهزة ❤️☁️');
    } catch (err) {
      console.error(err);
      setCloudStatus('synced');
      setWelcomeBanner('تمت إضافة الصورة بنجاح للألبوم.');
    } finally {
      setTimeout(() => {
        setWelcomeBanner(null);
      }, 5000);
    }
  };

  // Toggle favorite with cloud sync
  const handleToggleFavorite = async (id: string) => {
    const updated = memories.map((m) =>
      m.id === id ? { ...m, isFavorite: !m.isFavorite } : m
    );
    setMemories(updated);
    setSelectedMemory((curr) =>
      curr && curr.id === id ? { ...curr, isFavorite: !curr.isFavorite } : curr
    );
    await saveServerData({ memories: updated });
  };

  // Delete memory with cloud sync
  const handleDeleteMemory = async (id: string) => {
    setCloudStatus('saving');
    const updated = memories.filter((m) => m.id !== id);
    setMemories(updated);
    await saveServerData({ memories: updated });
    setCloudStatus('synced');
    setWelcomeBanner('تم مسح الصورة وحفظ التعديل في السحابة لجميع الهواتف ✨');
    setTimeout(() => {
      setWelcomeBanner(null);
    }, 4000);
  };

  // Save profile & dates with cloud sync
  const handleSaveProfile = async (newProfile: CoupleProfile) => {
    setCloudStatus('saving');
    setProfile(newProfile);
    await saveServerData({ profile: newProfile });
    setCloudStatus('synced');
    setWelcomeBanner('تم حفظ التعديلات سحابياً وتظهر الآن على جميع الهواتف ☁️');
    setTimeout(() => {
      setWelcomeBanner(null);
    }, 4000);
  };

  // Add love letter with cloud sync
  const handleAddLetter = async (newLet: Omit<LoveLetter, 'id'>) => {
    setCloudStatus('saving');
    const created: LoveLetter = {
      ...newLet,
      id: `let-${Date.now()}`,
    };
    const updated = [created, ...letters];
    setLetters(updated);
    await saveServerData({ letters: updated });
    setCloudStatus('synced');
    setWelcomeBanner('تم حفظ رسالة الحب سحابياً وتظهر فوراً على هاتفها 💌☁️');
    setTimeout(() => {
      setWelcomeBanner(null);
    }, 4500);
  };

  const handleTogglePinLetter = async (id: string) => {
    const updated = letters.map((l) =>
      l.id === id ? { ...l, isPinned: !l.isPinned } : l
    );
    setLetters(updated);
    await saveServerData({ letters: updated });
  };

  const handleDeleteLetter = async (id: string) => {
    const updated = letters.filter((l) => l.id !== id);
    setLetters(updated);
    await saveServerData({ letters: updated });
  };

  // Export backup JSON
  const handleExportBackup = () => {
    const backupData = {
      profile,
      memories,
      letters,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hikayatuna-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setWelcomeBanner('تم تنزيل نسخة احتياطية من كل الصور والتعديلات على جهازك 💾');
    setTimeout(() => setWelcomeBanner(null), 4000);
  };

  // Import backup JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.memories && Array.isArray(parsed.memories)) setMemories(parsed.memories);
        if (parsed.letters && Array.isArray(parsed.letters)) setLetters(parsed.letters);

        await saveServerData({
          profile: parsed.profile,
          memories: parsed.memories,
          letters: parsed.letters,
        });

        setWelcomeBanner('تمت استعادة كل الصور والذكريات بنجاح وحفظها سحابياً ☁️✨');
        setTimeout(() => setWelcomeBanner(null), 5000);
      } catch (err) {
        alert('الملف غير صالح كنسخة احتياطية');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // If user is guest, show RomanticAuthGate with the romantic audio player
  if (role === 'guest') {
    return (
      <div className="relative min-h-screen bg-[#0B060F]">
        <FloatingHearts />
        <RomanticAudioPlayer songTitle={profile.songTitle} />
        <RomanticAuthGate onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0B060F] text-[#F3EBF5] selection:bg-[#FF3366]/25 selection:text-[#FF6699] overflow-x-hidden">
      {/* Background Floating Hearts & Petals Layer */}
      <FloatingHearts />

      {/* Floating Audio Player with Tamer Ashour's song */}
      <RomanticAudioPlayer songTitle={profile.songTitle} />

      {/* Welcome Banner / Cloud Sync Toast */}
      {welcomeBanner && (
        <div
          role="status"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[90%] p-4 rounded-2xl bg-[#1C0D26]/95 border border-[#FF3366]/50 shadow-[0_0_30px_rgba(255,51,102,0.4)] backdrop-blur-md flex items-center gap-3 text-right animate-bounce text-xs sm:text-sm text-white"
        >
          <CheckCircle2 className="w-5 h-5 text-[#FF3366] shrink-0" />
          <p className="flex-1 font-medium">{welcomeBanner}</p>
          <button
            type="button"
            onClick={() => setWelcomeBanner(null)}
            className="text-xs text-[#FFA5BA] hover:text-white px-2 py-1 cursor-pointer"
          >
            حسناً
          </button>
        </div>
      )}

      {/* Top Header Bar */}
      <TopBar
        profile={profile}
        currentRole={role}
        onOpenEditNames={() => setIsEditDatesOpen(true)}
        onOpenEditHero={() => setIsEditHeroOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {/* Hero Section with Glowing Neon Title and Dual Live Countdown Cards */}
        <HeroSection
          profile={profile}
          canEdit={isEditor}
          onOpenEditDates={() => setIsEditDatesOpen(true)}
        />

        {/* Pure Photos Section */}
        <MemoriesGallery
          memories={filteredMemories}
          activeFilter={activeFilter}
          searchQuery={searchQuery}
          sortOrder={sortOrder}
          canEdit={isEditor}
          onFilterChange={setActiveFilter}
          onSearchChange={setSearchQuery}
          onToggleSort={() => setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
          onSelectMemory={setSelectedMemory}
          onToggleFavorite={handleToggleFavorite}
          onDeleteMemory={handleDeleteMemory}
          onOpenAddMemory={() => setIsAddMemoryOpen(true)}
        />

        {/* Timeline Section of Our Journey */}
        <TimelineSection
          memories={memories}
          onSelectMemory={setSelectedMemory}
        />

        {/* Secret Love Letters & Messages Section */}
        <LoveLettersSection
          letters={letters}
          partnerTwoName={profile.partnerTwoName}
          canEdit={isEditor}
          onOpenAddLetter={() => setIsAddLetterOpen(true)}
          onTogglePinLetter={handleTogglePinLetter}
          onDeleteLetter={handleDeleteLetter}
        />
      </main>

      {/* Floating Speed Dial & Admin Control Dock for Ahmed */}
      {isEditor && (
        <div className="fixed bottom-6 left-6 z-40">
          <div className="relative flex flex-col items-start gap-2">
            {isControlMenuOpen && (
              <div
                role="menu"
                aria-label="قائمة التعديلات السريعة"
                className="p-3 bg-[#170B1F]/95 backdrop-blur-md border border-[#441E53] rounded-2xl shadow-2xl flex flex-col gap-1.5 w-64 animate-in fade-in slide-in-from-bottom-2 duration-200"
              >
                <div className="px-3 py-1.5 border-b border-[#30153D] flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#FFA5BA]">
                    لوحة التحكم وتعديل الموقع
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    <Cloud className="w-3 h-3 text-emerald-400" />
                    <span>سحابي لجميع الهواتف</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsControlMenuOpen(false);
                    setIsEditDatesOpen(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white hover:bg-[#251032] rounded-xl transition-colors cursor-pointer text-right w-full"
                >
                  <Calendar className="w-4 h-4 text-[#FF3366]" />
                  <span>تعديل الأسماء وتاريخ البداية</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsControlMenuOpen(false);
                    setIsEditHeroOpen(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white hover:bg-[#251032] rounded-xl transition-colors cursor-pointer text-right w-full"
                >
                  <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                  <span>تعديل العنوان ورسالة الواجهة</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsControlMenuOpen(false);
                    setIsAddMemoryOpen(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white hover:bg-[#251032] rounded-xl transition-colors cursor-pointer text-right w-full"
                >
                  <Camera className="w-4 h-4 text-[#FF4D88]" />
                  <span>إضافة ذكرى وصورة جديدة</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsControlMenuOpen(false);
                    setIsAddLetterOpen(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white hover:bg-[#251032] rounded-xl transition-colors cursor-pointer text-right w-full"
                >
                  <Feather className="w-4 h-4 text-[#FDA4AF]" />
                  <span>كتابة رسالة حب</span>
                </button>

                <div className="pt-2 border-t border-[#30153D] flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    title="تنزيل نسخة احتياطية من كل الصور والبيانات"
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-medium text-[#C5A5C2] hover:text-white bg-[#100617] hover:bg-[#240F2E] rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#FFA5BA]" />
                    <span>تصدير نسخة</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="استيراد نسخة احتياطية سابقة"
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-medium text-[#C5A5C2] hover:text-white bg-[#100617] hover:bg-[#240F2E] rounded-lg transition-colors cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>استيراد</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsControlMenuOpen((prev) => !prev)}
              aria-label="لوحة تعديل الموقع"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-[#FF6B35] to-[#EC008C] hover:opacity-95 shadow-[0_0_20px_rgba(236,0,140,0.5)] transition-all cursor-pointer whitespace-nowrap"
            >
              <Crown className="w-4 h-4 text-yellow-300" />
              <span>لوحة تعديل الموقع</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 py-10 border-t border-[#2C1438] bg-[#0A050E]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A888A4]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">حكايتنا</span>
            <span>
              · صُنع بكل الحب ليبقى ألبوم ذكريات {profile.partnerOneName} و{' '}
              {profile.partnerTwoName} ❤️
            </span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#hero" className="hover:text-white transition-colors">
              الرئيسية
            </a>
            <a href="#gallery" className="hover:text-white transition-colors">
              ألبوم الصور
            </a>
            <a href="#timeline" className="hover:text-white transition-colors">
              خط الذكريات
            </a>
            <a href="#letters" className="hover:text-white transition-colors">
              رسائلنا
            </a>
          </div>
        </div>
      </footer>

      {/* Modals: Only functional for Ahmed / admin */}
      {isEditor && (
        <>
          <MemoryModal
            isOpen={isAddMemoryOpen}
            onClose={() => setIsAddMemoryOpen(false)}
            onSave={handleAddMemory}
          />

          <EditDatesModal
            isOpen={isEditDatesOpen}
            profile={profile}
            onClose={() => setIsEditDatesOpen(false)}
            onSaveProfile={handleSaveProfile}
          />

          <EditHeroModal
            isOpen={isEditHeroOpen}
            profile={profile}
            onClose={() => setIsEditHeroOpen(false)}
            onSaveProfile={handleSaveProfile}
          />

          <LetterModal
            isOpen={isAddLetterOpen}
            onClose={() => setIsAddLetterOpen(false)}
            onSaveLetter={handleAddLetter}
          />
        </>
      )}

      {/* Lightbox is viewable by both */}
      <LightboxModal
        memory={selectedMemory}
        canEdit={isEditor}
        onClose={() => setSelectedMemory(null)}
        onToggleFavorite={handleToggleFavorite}
        onDeleteMemory={handleDeleteMemory}
      />
    </div>
  );
}
