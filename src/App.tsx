/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User } from 'firebase/auth';
import {
  Crown,
  Camera,
  Feather,
  Calendar,
  Sparkles,
  CheckCircle2,
  Cloud,
  Download,
  UploadCloud,
  AlertTriangle,
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
} from './utils/apiClient';
import { optimizeImage } from './utils/imageOptimizer';
import {
  ADMIN_OWNER_EMAIL,
  isVerifiedAdminUser,
  signInAdminWithGoogle,
  signOutFirebaseAdmin,
  subscribeToAuthState,
  subscribeToSiteSettings,
  subscribeToMemories,
  subscribeToLetters,
  saveProfileToFirestore,
  createMemoryInFirestore,
  updateMemoryFavoriteInFirestore,
  deleteMemoryFromFirestore,
  createLetterInFirestore,
  updateLetterPinInFirestore,
  deleteLetterFromFirestore,
  syncAllDataToFirestore,
} from './firebase';
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
};

export default function App() {
  // Passcode Authentication State
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

  // Firebase Owner Auth State (required for writing shared cloud updates)
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isConnectingCloud, setIsConnectingCloud] = useState(false);
  const [hasPendingLocalEdits, setHasPendingLocalEdits] = useState(false);

  const [welcomeBanner, setWelcomeBanner] = useState<string | null>(null);
  const [cloudStatus, setCloudStatus] = useState<'synced' | 'saving' | 'offline'>('synced');

  // Local/Fallback State (used prior to initial Firestore sync or before seeding)
  const [localProfile, setLocalProfile] = useState<CoupleProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : INITIAL_COUPLE_PROFILE;
    } catch {
      return INITIAL_COUPLE_PROFILE;
    }
  });

  const [localMemories, setLocalMemories] = useState<MemoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEMORIES);
      return saved ? JSON.parse(saved) : INITIAL_MEMORIES;
    } catch {
      return INITIAL_MEMORIES;
    }
  });

  const [localLetters, setLocalLetters] = useState<LoveLetter[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LETTERS);
      return saved ? JSON.parse(saved) : INITIAL_LETTERS;
    } catch {
      return INITIAL_LETTERS;
    }
  });

  // Authoritative Shared Cloud State (Firestore)
  const [remoteInitialized, setRemoteInitialized] = useState<boolean | null>(null);
  const [remoteProfile, setRemoteProfile] = useState<CoupleProfile | null>(null);
  const [remoteMemories, setRemoteMemories] = useState<MemoryItem[]>([]);
  const [remoteLetters, setRemoteLetters] = useState<LoveLetter[]>([]);

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
  const manualConnectInFlightRef = useRef(false);
  const isEditor = canEditSite(role);
  const isCloudAdmin = isVerifiedAdminUser(firebaseUser);

  // Active data shown on screen: Firestore is authoritative whenever initialized
  const profile = remoteInitialized && remoteProfile ? remoteProfile : localProfile;
  const memories = remoteInitialized ? remoteMemories : localMemories;
  const letters = remoteInitialized ? remoteLetters : localLetters;

  // Keep refs to latest local data for automatic one-time migration when owner connects
  const latestDataRef = useRef({ profile, memories, letters });
  useEffect(() => {
    latestDataRef.current = { profile, memories, letters };
  }, [profile, memories, letters]);

  // 1. Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubAuth = subscribeToAuthState((user) => {
      setFirebaseUser(user);
    });
    return () => unsubAuth();
  }, []);

  // 2. Subscribe to real-time Firestore collections (works across ALL links & devices)
  useEffect(() => {
    const unsubSettings = subscribeToSiteSettings(
      (cloudProfile, exists) => {
        setRemoteInitialized(exists);
        if (exists && cloudProfile) {
          setRemoteProfile(cloudProfile);
          setLocalProfile(cloudProfile);
        }
        setCloudStatus('synced');
      },
      () => {
        setCloudStatus('offline');
      }
    );

    const unsubMemories = subscribeToMemories(
      (cloudMemories) => {
        setRemoteMemories(cloudMemories);
        setCloudStatus('synced');
      },
      () => {
        setCloudStatus('offline');
      }
    );

    const unsubLetters = subscribeToLetters(
      (cloudLetters) => {
        setRemoteLetters(cloudLetters);
        setCloudStatus('synced');
      },
      () => {
        setCloudStatus('offline');
      }
    );

    return () => {
      unsubSettings();
      unsubMemories();
      unsubLetters();
    };
  }, []);

  // 3. Load any existing local container edits (data/store.json) ONLY if Firestore is not seeded yet
  useEffect(() => {
    if (remoteInitialized !== false) return;
    let isMounted = true;

    async function loadUnseededLocalServer() {
      try {
        const remote = await fetchServerData();
        if (!isMounted || !remote) return;
        if (remote.profile) setLocalProfile(remote.profile);
        if (remote.memories && Array.isArray(remote.memories)) setLocalMemories(remote.memories);
        if (remote.letters && Array.isArray(remote.letters)) setLocalLetters(remote.letters);
      } catch {
        // Ignore if server storage is unavailable
      }
    }

    loadUnseededLocalServer();
    return () => {
      isMounted = false;
    };
  }, [remoteInitialized]);

  // 4. Auto-seed Firestore when the verified owner connects for the first time
  useEffect(() => {
    if (
      remoteInitialized === false &&
      isCloudAdmin &&
      firebaseUser &&
      !manualConnectInFlightRef.current
    ) {
      const current = latestDataRef.current;
      void syncAllDataToFirestore(
        current.profile,
        current.memories,
        current.letters,
        firebaseUser.uid,
        true
      )
        .then((seeded) => {
          if (seeded) {
            setHasPendingLocalEdits(false);
            setWelcomeBanner('تم رفع بياناتك للسحابة بنجاح وتظهر الآن على كل الروابط والهواتف ☁️✅');
            setTimeout(() => setWelcomeBanner(null), 5000);
          }
        })
        .catch((err) => {
          console.error('Auto-seed error:', err);
        });
    }
  }, [remoteInitialized, isCloudAdmin, firebaseUser]);

  // Sync offline cache in localStorage whenever active data updates
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

  const showToast = (msg: string, durationMs = 5000) => {
    setWelcomeBanner(msg);
    setTimeout(() => {
      setWelcomeBanner(null);
    }, durationMs);
  };

  // Connect Google owner account so writes sync across all shared links & devices
  const handleConnectCloudOwner = async (pushLocalChanges = false) => {
    manualConnectInFlightRef.current = true;
    setIsConnectingCloud(true);
    try {
      const user = await signInAdminWithGoogle();
      if (!isVerifiedAdminUser(user)) {
        await signOutFirebaseAdmin();
        showToast(
          `يرجى تسجيل الدخول بحساب المالك (${ADMIN_OWNER_EMAIL}) لتفعيل الحفظ السحابي للجميع.`,
          7000
        );
        return;
      }

      if (pushLocalChanges || hasPendingLocalEdits || remoteInitialized === false) {
        setCloudStatus('saving');
        const current = latestDataRef.current;
        await syncAllDataToFirestore(
          current.profile,
          current.memories,
          current.letters,
          user.uid,
          false
        );
        setHasPendingLocalEdits(false);
        setCloudStatus('synced');
        showToast('تم تفعيل الحفظ السحابي ورفع كل تعديلاتك لتظهر على كل الروابط والهواتف فوراً ☁️❤️');
      } else {
        showToast('تم تفعيل الحفظ السحابي بنجاح! أي تعديل ستحفظه سيظهر للجميع فوراً ☁️✅');
      }
    } catch (err) {
      console.error('Google owner sign-in error:', err);
      showToast('لم يكتمل تسجيل الدخول بحساب Google، حاول مرة أخرى لتفعيل الحفظ للجميع.');
    } finally {
      manualConnectInFlightRef.current = false;
      setIsConnectingCloud(false);
    }
  };

  const handleManualPushToCloud = async () => {
    if (!isCloudAdmin || !firebaseUser) {
      await handleConnectCloudOwner(true);
      return;
    }
    setCloudStatus('saving');
    try {
      await syncAllDataToFirestore(profile, memories, letters, firebaseUser.uid, false);
      setHasPendingLocalEdits(false);
      setCloudStatus('synced');
      showToast('تمت مزامنة كل الصور والتعديلات في السحابة لجميع الهواتف ☁️✅');
    } catch (err) {
      console.error(err);
      setCloudStatus('offline');
      showToast('تعذرت المزامنة مع السحابة، يرجى المحاولة مرة أخرى.');
    }
  };

  const handleLoginSuccess = (newRole: UserRole, _displayName: string, welcomeMsg?: string) => {
    setRole(newRole);
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_ROLE, newRole);
    } catch {
      // Ignore
    }
    if (welcomeMsg) {
      showToast(welcomeMsg, 7000);
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

  // Add memory & sync to Firestore
  const handleAddMemory = async (newMem: Omit<MemoryItem, 'id'>) => {
    setCloudStatus('saving');
    showToast('جاري حفظ الصورة ورفعها للسحابة... ☁️', 6000);

    try {
      const compressedUrl = newMem.imageUrl.startsWith('data:image/')
        ? await optimizeImage(newMem.imageUrl)
        : newMem.imageUrl;

      const created: MemoryItem = {
        ...newMem,
        imageUrl: compressedUrl,
        id: `mem_${Date.now()}`,
      };

      const updatedLocal = [created, ...memories];
      setLocalMemories(updatedLocal);
      void saveServerData({ memories: updatedLocal });

      if (isCloudAdmin && firebaseUser) {
        if (remoteInitialized === false) {
          await syncAllDataToFirestore(profile, updatedLocal, letters, firebaseUser.uid, false);
        } else {
          await createMemoryInFirestore(created, firebaseUser.uid);
        }
        setCloudStatus('synced');
        showToast('تم حفظ الصورة في السحابة وتظهر الآن على كل الروابط والهواتف ❤️☁️');
      } else {
        setHasPendingLocalEdits(true);
        setCloudStatus('offline');
        showToast(
          'تم حفظ الصورة مؤقتاً عندك فقط! اضغط "تفعيل الحفظ السحابي" بالأعلى لتظهر على رابط المشاركة ☁️',
          8000
        );
      }
    } catch (err) {
      console.error(err);
      setCloudStatus('offline');
      showToast('حدث خطأ أثناء رفع الصورة للسحابة، يرجى المحاولة مرة أخرى.');
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (id: string) => {
    const target = memories.find((m) => m.id === id);
    if (!target) return;
    const nextFav = !target.isFavorite;

    const updatedLocal = memories.map((m) =>
      m.id === id ? { ...m, isFavorite: nextFav } : m
    );
    setLocalMemories(updatedLocal);
    if (remoteInitialized) {
      setRemoteMemories(updatedLocal);
    }
    setSelectedMemory((curr) =>
      curr && curr.id === id ? { ...curr, isFavorite: nextFav } : curr
    );

    if (isEditor && isCloudAdmin && firebaseUser) {
      try {
        if (remoteInitialized === false) {
          await syncAllDataToFirestore(profile, updatedLocal, letters, firebaseUser.uid, false);
        } else {
          await updateMemoryFavoriteInFirestore(id, nextFav);
        }
      } catch (err) {
        console.error(err);
      }
    } else if (isEditor) {
      setHasPendingLocalEdits(true);
      void saveServerData({ memories: updatedLocal });
    }
  };

  // Delete memory & sync to Firestore
  const handleDeleteMemory = async (id: string) => {
    setCloudStatus('saving');
    const updatedLocal = memories.filter((m) => m.id !== id);
    setLocalMemories(updatedLocal);
    void saveServerData({ memories: updatedLocal });

    if (isCloudAdmin && firebaseUser) {
      try {
        if (remoteInitialized === false) {
          await syncAllDataToFirestore(profile, updatedLocal, letters, firebaseUser.uid, false);
        } else {
          await deleteMemoryFromFirestore(id);
        }
        setCloudStatus('synced');
        showToast('تم مسح الصورة وحفظ التعديل في السحابة لجميع الهواتف والروابط ✨☁️');
      } catch (err) {
        console.error(err);
        setCloudStatus('offline');
        showToast('تعذر مسح الصورة من السحابة، يرجى المحاولة مرة أخرى.');
      }
    } else {
      if (remoteInitialized) {
        setRemoteMemories(updatedLocal);
      }
      setHasPendingLocalEdits(true);
      setCloudStatus('offline');
      showToast(
        'تم المسح مؤقتاً عندك فقط! اضغط "تفعيل الحفظ السحابي" بالأعلى ليتم الحفظ على رابط المشاركة ☁️',
        8000
      );
    }
  };

  // Save profile & dates & sync to Firestore
  const handleSaveProfile = async (newProfile: CoupleProfile) => {
    setCloudStatus('saving');
    setLocalProfile(newProfile);
    if (remoteInitialized) {
      setRemoteProfile(newProfile);
    }
    void saveServerData({ profile: newProfile });

    if (isCloudAdmin && firebaseUser) {
      try {
        if (remoteInitialized === false) {
          await syncAllDataToFirestore(newProfile, memories, letters, firebaseUser.uid, false);
        } else {
          await saveProfileToFirestore(newProfile, firebaseUser.uid);
        }
        setCloudStatus('synced');
        showToast('تم حفظ التعديلات سحابياً وتظهر الآن على كل الروابط والهواتف ☁️❤️');
      } catch (err) {
        console.error(err);
        setCloudStatus('offline');
        showToast('تعذر حفظ التعديلات في السحابة، يرجى المحاولة مرة أخرى.');
      }
    } else {
      setHasPendingLocalEdits(true);
      setCloudStatus('offline');
      showToast(
        'تم الحفظ مؤقتاً عندك فقط! اضغط "تفعيل الحفظ السحابي" بالأعلى ليظهر التعديل للجميع ☁️',
        8000
      );
    }
  };

  // Add love letter & sync to Firestore
  const handleAddLetter = async (newLet: Omit<LoveLetter, 'id'>) => {
    setCloudStatus('saving');
    const created: LoveLetter = {
      ...newLet,
      id: `let_${Date.now()}`,
    };
    const updatedLocal = [created, ...letters];
    setLocalLetters(updatedLocal);
    void saveServerData({ letters: updatedLocal });

    if (isCloudAdmin && firebaseUser) {
      try {
        if (remoteInitialized === false) {
          await syncAllDataToFirestore(profile, memories, updatedLocal, firebaseUser.uid, false);
        } else {
          await createLetterInFirestore(created, firebaseUser.uid);
        }
        setCloudStatus('synced');
        showToast('تم حفظ رسالة الحب سحابياً وتظهر فوراً على هاتفها 💌☁️');
      } catch (err) {
        console.error(err);
        setCloudStatus('offline');
        showToast('تعذر حفظ الرسالة في السحابة، يرجى المحاولة مرة أخرى.');
      }
    } else {
      if (remoteInitialized) {
        setRemoteLetters(updatedLocal);
      }
      setHasPendingLocalEdits(true);
      setCloudStatus('offline');
      showToast(
        'تم حفظ الرسالة مؤقتاً عندك فقط! اضغط "تفعيل الحفظ السحابي" بالأعلى لتظهر على رابط المشاركة ☁️',
        8000
      );
    }
  };

  const handleTogglePinLetter = async (id: string) => {
    const target = letters.find((l) => l.id === id);
    if (!target) return;
    const nextPinned = !target.isPinned;

    const updatedLocal = letters.map((l) =>
      l.id === id ? { ...l, isPinned: nextPinned } : l
    );
    setLocalLetters(updatedLocal);
    if (remoteInitialized) {
      setRemoteLetters(updatedLocal);
    }
    void saveServerData({ letters: updatedLocal });

    if (isCloudAdmin && firebaseUser) {
      try {
        if (remoteInitialized === false) {
          await syncAllDataToFirestore(profile, memories, updatedLocal, firebaseUser.uid, false);
        } else {
          await updateLetterPinInFirestore(id, nextPinned);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setHasPendingLocalEdits(true);
    }
  };

  const handleDeleteLetter = async (id: string) => {
    const updatedLocal = letters.filter((l) => l.id !== id);
    setLocalLetters(updatedLocal);
    if (remoteInitialized) {
      setRemoteLetters(updatedLocal);
    }
    void saveServerData({ letters: updatedLocal });

    if (isCloudAdmin && firebaseUser) {
      try {
        if (remoteInitialized === false) {
          await syncAllDataToFirestore(profile, memories, updatedLocal, firebaseUser.uid, false);
        } else {
          await deleteLetterFromFirestore(id);
        }
        showToast('تم حذف الرسالة وتحديث السحابة لجميع الهواتف ☁️');
      } catch (err) {
        console.error(err);
      }
    } else {
      setHasPendingLocalEdits(true);
    }
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
    showToast('تم تنزيل نسخة احتياطية من كل الصور والتعديلات على جهازك 💾');
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
        const importedProfile = parsed.profile || profile;
        const importedMemories = Array.isArray(parsed.memories) ? parsed.memories : memories;
        const importedLetters = Array.isArray(parsed.letters) ? parsed.letters : letters;

        setLocalProfile(importedProfile);
        setLocalMemories(importedMemories);
        setLocalLetters(importedLetters);
        void saveServerData({
          profile: importedProfile,
          memories: importedMemories,
          letters: importedLetters,
        });

        if (isCloudAdmin && firebaseUser) {
          await syncAllDataToFirestore(
            importedProfile,
            importedMemories,
            importedLetters,
            firebaseUser.uid,
            false
          );
          showToast('تمت استعادة كل الصور والذكريات بنجاح وحفظها سحابياً للجميع ☁️✨');
        } else {
          setHasPendingLocalEdits(true);
          showToast('تم الاستيراد مؤقتاً — اضغط "تفعيل الحفظ السحابي" لنشره للجميع ☁️');
        }
      } catch {
        showToast('الملف غير صالح كنسخة احتياطية');
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

      {/* Cloud Owner Activation Banner (only shown to Ahmed if Google cloud auth is not yet connected) */}
      {isEditor && !isCloudAdmin && (
        <div
          role="region"
          aria-label="تفعيل الحفظ السحابي المشترك"
          className="relative z-40 bg-gradient-to-r from-[#2D0D26] via-[#3A102F] to-[#2D0D26] border-b border-[#FF3366]/50 px-4 py-3 text-white shadow-lg"
        >
          <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5 text-center sm:text-right">
              <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
              <p className="font-medium text-[#FFE4EE]">
                {hasPendingLocalEdits
                  ? 'لديك تعديلات لم تُرفع للسحابة بعد! فعّل حساب المالك الآن لتظهر على رابط المشاركة وعند كل الناس.'
                  : 'لتظهر تعديلاتك وصورك عند أي شخص يفتح رابط الموقع من أي هاتف، قم بتفعيل الحفظ السحابي بحسابك الآن.'}
              </p>
            </div>
            <button
              type="button"
              disabled={isConnectingCloud}
              onClick={() => handleConnectCloudOwner(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF3366] to-[#E11D48] hover:from-[#FF4D88] hover:to-[#F43F5E] text-white font-bold text-xs shadow-[0_0_20px_rgba(255,51,102,0.5)] transition-all cursor-pointer shrink-0 disabled:opacity-60"
            >
              <Cloud className="w-4 h-4" />
              <span>
                {isConnectingCloud
                  ? 'جاري الربط بالسحابة...'
                  : hasPendingLocalEdits
                  ? 'رفع التعديلات للسحابة الآن (Google)'
                  : 'تفعيل الحفظ السحابي للجميع (Google)'}
              </span>
            </button>
          </div>
        </div>
      )}

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
                className="p-3 bg-[#170B1F]/95 backdrop-blur-md border border-[#441E53] rounded-2xl shadow-2xl flex flex-col gap-1.5 w-72 animate-in fade-in slide-in-from-bottom-2 duration-200"
              >
                <div className="px-3 py-1.5 border-b border-[#30153D] flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-[#FFA5BA]">
                    لوحة التحكم وتعديل الموقع
                  </span>
                  {isCloudAdmin ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      <Cloud className="w-3 h-3 text-emerald-400" />
                      <span>{cloudStatus === 'saving' ? 'جاري الحفظ...' : 'سحابي للجميع'}</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleConnectCloudOwner(true)}
                      className="inline-flex items-center gap-1 text-[10px] text-amber-300 bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded-full hover:bg-amber-900 cursor-pointer"
                    >
                      <Cloud className="w-3 h-3" />
                      <span>ربط السحابة</span>
                    </button>
                  )}
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

                <button
                  type="button"
                  onClick={() => {
                    setIsControlMenuOpen(false);
                    void handleManualPushToCloud();
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-[#251032] rounded-xl transition-colors cursor-pointer text-right w-full"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  <span>مزامنة التعديلات للجميع الآن</span>
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
