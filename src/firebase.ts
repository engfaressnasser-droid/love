import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  CoupleProfile,
  MemoryItem,
  LoveLetter,
  INITIAL_COUPLE_PROFILE,
} from './utils/memoriesLogic';
import { ensurePortableImageUrl } from './utils/imageOptimizer';

export const ADMIN_OWNER_EMAIL = 'eng.faressnasser@gmail.com';
const SITE_SETTING_DOC_ID = 'main';
const ALBUM_SCOPE = 'hikayatuna_main';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on initial boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

export function isVerifiedAdminUser(user: User | null): boolean {
  if (!user) return false;
  return (
    user.emailVerified === true &&
    (user.email || '').toLowerCase() === ADMIN_OWNER_EMAIL.toLowerCase()
  );
}

export async function signInAdminWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutFirebaseAdmin(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

// --- Sanitization Helpers aligned strictly with firebase-blueprint.json & firestore.rules ---

function sanitizeId(rawId: string, prefix: string): string {
  const cleaned = (rawId || '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  return cleaned.length > 0 ? cleaned : `${prefix}_${Date.now()}`;
}

function sanitizeDate(rawDate: string | undefined, fallback = '2024-05-21'): string {
  const trimmed = (rawDate || '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : fallback;
}

function sanitizeProfilePayload(profile: CoupleProfile) {
  return {
    partnerOneName: (profile.partnerOneName || INITIAL_COUPLE_PROFILE.partnerOneName).trim().slice(0, 80) || 'أحمد',
    partnerTwoName: (profile.partnerTwoName || INITIAL_COUPLE_PROFILE.partnerTwoName).trim().slice(0, 80) || 'حبيبتي',
    startDate: sanitizeDate(profile.startDate, INITIAL_COUPLE_PROFILE.startDate),
    firstMetLabel: (profile.firstMetLabel ?? INITIAL_COUPLE_PROFILE.firstMetLabel).trim().slice(0, 120),
    romanticTagline: (profile.romanticTagline ?? INITIAL_COUPLE_PROFILE.romanticTagline).trim().slice(0, 120),
    heroTitle: (profile.heroTitle || INITIAL_COUPLE_PROFILE.heroTitle).trim().slice(0, 300) || INITIAL_COUPLE_PROFILE.heroTitle,
    heroSubtitle: (profile.heroSubtitle ?? INITIAL_COUPLE_PROFILE.heroSubtitle).trim().slice(0, 1000),
    heroImageUrl: (profile.heroImageUrl ?? INITIAL_COUPLE_PROFILE.heroImageUrl).slice(0, 600000),
    songTitle: (profile.songTitle ?? INITIAL_COUPLE_PROFILE.songTitle).trim().slice(0, 200),
  };
}

function sanitizeMemoryPayload(memory: MemoryItem) {
  const allowedCategories = ['first_moments', 'trips', 'special_dates', 'everyday'] as const;
  const category = allowedCategories.includes(memory.category)
    ? memory.category
    : 'special_dates';
  const featuredSpan: 'wide' | 'standard' =
    memory.featuredSpan === 'wide' ? 'wide' : 'standard';

  return {
    id: sanitizeId(memory.id, 'mem'),
    title: (memory.title || 'ذكرى جميلة').trim().slice(0, 200) || 'ذكرى جميلة',
    date: sanitizeDate(memory.date),
    location: (memory.location || 'معاً').trim().slice(0, 200) || 'معاً',
    category,
    story: (memory.story || 'لحظة رائعة في حكايتنا').trim().slice(0, 3000) || 'لحظة رائعة في حكايتنا',
    imageUrl: (memory.imageUrl || INITIAL_COUPLE_PROFILE.heroImageUrl).slice(0, 600000),
    isFavorite: Boolean(memory.isFavorite),
    featuredSpan,
    albumScope: ALBUM_SCOPE,
  };
}

function sanitizeLetterPayload(letter: LoveLetter) {
  return {
    id: sanitizeId(letter.id, 'let'),
    title: (letter.title || 'رسالة حب').trim().slice(0, 200) || 'رسالة حب',
    date: sanitizeDate(letter.date, '2025-05-21'),
    occasion: (letter.occasion ?? 'رسالة خاصة').trim().slice(0, 200),
    content: (letter.content || 'أحبكِ دائماً').trim().slice(0, 5000) || 'أحبكِ دائماً',
    signature: (letter.signature ?? 'محبكِ').trim().slice(0, 120),
    isPinned: Boolean(letter.isPinned),
    albumScope: ALBUM_SCOPE,
  };
}

// --- Real-Time Listeners (Work across ALL devices & shared links) ---

export function subscribeToSiteSettings(
  onData: (profile: CoupleProfile | null, exists: boolean) => void,
  onError?: (err: unknown) => void
): () => void {
  const path = `site_settings/${SITE_SETTING_DOC_ID}`;
  const docRef = doc(db, 'site_settings', SITE_SETTING_DOC_ID);
  return onSnapshot(
    docRef,
    (snap) => {
      if (!snap.exists()) {
        onData(null, false);
        return;
      }
      const d = snap.data();
      onData(
        {
          partnerOneName: d.partnerOneName || INITIAL_COUPLE_PROFILE.partnerOneName,
          partnerTwoName: d.partnerTwoName || INITIAL_COUPLE_PROFILE.partnerTwoName,
          startDate: d.startDate || INITIAL_COUPLE_PROFILE.startDate,
          firstMetLabel: d.firstMetLabel ?? INITIAL_COUPLE_PROFILE.firstMetLabel,
          romanticTagline: d.romanticTagline ?? INITIAL_COUPLE_PROFILE.romanticTagline,
          heroTitle: d.heroTitle || INITIAL_COUPLE_PROFILE.heroTitle,
          heroSubtitle: d.heroSubtitle ?? INITIAL_COUPLE_PROFILE.heroSubtitle,
          heroImageUrl: d.heroImageUrl ?? INITIAL_COUPLE_PROFILE.heroImageUrl,
          songTitle: d.songTitle ?? INITIAL_COUPLE_PROFILE.songTitle,
        },
        true
      );
    },
    (error) => {
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch {
        // Logged via handleFirestoreError
      }
    }
  );
}

export function subscribeToMemories(
  onData: (memories: MemoryItem[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const path = 'memories';
  const memoriesQuery = query(
    collection(db, path),
    where('albumScope', '==', ALBUM_SCOPE)
  );
  return onSnapshot(
    memoriesQuery,
    (snapshot) => {
      const items: MemoryItem[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: data.id || d.id,
          title: data.title || '',
          date: data.date || '2024-05-21',
          location: data.location || '',
          category: data.category || 'special_dates',
          story: data.story || '',
          imageUrl: data.imageUrl || INITIAL_COUPLE_PROFILE.heroImageUrl,
          isFavorite: Boolean(data.isFavorite),
          featuredSpan: data.featuredSpan === 'wide' ? 'wide' : 'standard',
        };
      });
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Logged via handleFirestoreError
      }
    }
  );
}

export function subscribeToLetters(
  onData: (letters: LoveLetter[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const path = 'letters';
  const lettersQuery = query(
    collection(db, path),
    where('albumScope', '==', ALBUM_SCOPE)
  );
  return onSnapshot(
    lettersQuery,
    (snapshot) => {
      const items: LoveLetter[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: data.id || d.id,
          title: data.title || '',
          date: data.date || '2025-05-21',
          occasion: data.occasion || '',
          content: data.content || '',
          signature: data.signature || '',
          isPinned: Boolean(data.isPinned),
        };
      });
      // Sort newest / pinned friendly order
      items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Logged via handleFirestoreError
      }
    }
  );
}

// --- Firestore Write Operations (Verified Admin Only) ---

export async function saveProfileToFirestore(
  profile: CoupleProfile,
  ownerUid: string
): Promise<void> {
  const path = `site_settings/${SITE_SETTING_DOC_ID}`;
  const docRef = doc(db, 'site_settings', SITE_SETTING_DOC_ID);
  const sanitized = sanitizeProfilePayload(profile);

  try {
    const existingSnap = await getDoc(docRef);
    if (existingSnap.exists()) {
      await updateDoc(docRef, {
        ...sanitized,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        ...sanitized,
        ownerId: ownerUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function createMemoryInFirestore(
  memory: MemoryItem,
  ownerUid: string
): Promise<MemoryItem> {
  const portableImageUrl = await ensurePortableImageUrl(memory.imageUrl);
  const sanitized = sanitizeMemoryPayload({
    ...memory,
    imageUrl: portableImageUrl,
  });
  const path = `memories/${sanitized.id}`;
  const docRef = doc(db, 'memories', sanitized.id);

  try {
    const existingSnap = await getDoc(docRef);
    if (existingSnap.exists()) {
      await updateDoc(docRef, {
        title: sanitized.title,
        date: sanitized.date,
        location: sanitized.location,
        category: sanitized.category,
        story: sanitized.story,
        imageUrl: sanitized.imageUrl,
        isFavorite: sanitized.isFavorite,
        featuredSpan: sanitized.featuredSpan,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        ...sanitized,
        ownerId: ownerUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return sanitized;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateMemoryFavoriteInFirestore(
  id: string,
  isFavorite: boolean
): Promise<void> {
  const safeId = sanitizeId(id, 'mem');
  const path = `memories/${safeId}`;
  try {
    await updateDoc(doc(db, 'memories', safeId), {
      isFavorite: Boolean(isFavorite),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteMemoryFromFirestore(id: string): Promise<void> {
  const safeId = sanitizeId(id, 'mem');
  const path = `memories/${safeId}`;
  try {
    await deleteDoc(doc(db, 'memories', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function createLetterInFirestore(
  letter: LoveLetter,
  ownerUid: string
): Promise<LoveLetter> {
  const sanitized = sanitizeLetterPayload(letter);
  const path = `letters/${sanitized.id}`;
  const docRef = doc(db, 'letters', sanitized.id);

  try {
    const existingSnap = await getDoc(docRef);
    if (existingSnap.exists()) {
      await updateDoc(docRef, {
        title: sanitized.title,
        date: sanitized.date,
        occasion: sanitized.occasion,
        content: sanitized.content,
        signature: sanitized.signature,
        isPinned: sanitized.isPinned,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        ...sanitized,
        ownerId: ownerUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return sanitized;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateLetterPinInFirestore(
  id: string,
  isPinned: boolean
): Promise<void> {
  const safeId = sanitizeId(id, 'let');
  const path = `letters/${safeId}`;
  try {
    await updateDoc(doc(db, 'letters', safeId), {
      isPinned: Boolean(isPinned),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteLetterFromFirestore(id: string): Promise<void> {
  const safeId = sanitizeId(id, 'let');
  const path = `letters/${safeId}`;
  try {
    await deleteDoc(doc(db, 'letters', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

let activeSyncPromise: Promise<boolean> | null = null;

/**
 * Checks if Firestore has been initialized; if not, uploads all current local/server
 * profile, memories, and letters to Firestore so all existing edits immediately
 * appear on the shared link across every device.
 */
export async function syncAllDataToFirestore(
  profile: CoupleProfile,
  memories: MemoryItem[],
  letters: LoveLetter[],
  ownerUid: string,
  onlyIfEmpty = false
): Promise<boolean> {
  if (activeSyncPromise) {
    return activeSyncPromise;
  }

  const runSync = async (): Promise<boolean> => {
    const siteDocRef = doc(db, 'site_settings', SITE_SETTING_DOC_ID);
    try {
      const existingSnap = await getDoc(siteDocRef);
      if (onlyIfEmpty && existingSnap.exists()) {
        return false;
      }

      await saveProfileToFirestore(profile, ownerUid);

      for (const mem of memories) {
        const safeId = sanitizeId(mem.id, 'mem');
        const memRef = doc(db, 'memories', safeId);
        const memSnap = await getDoc(memRef);
        if (!memSnap.exists()) {
          await createMemoryInFirestore({ ...mem, id: safeId }, ownerUid);
        } else if (!onlyIfEmpty) {
          const portableImageUrl = await ensurePortableImageUrl(mem.imageUrl);
          const sanitized = sanitizeMemoryPayload({ ...mem, id: safeId, imageUrl: portableImageUrl });
          await updateDoc(memRef, {
            title: sanitized.title,
            date: sanitized.date,
            location: sanitized.location,
            category: sanitized.category,
            story: sanitized.story,
            imageUrl: sanitized.imageUrl,
            isFavorite: sanitized.isFavorite,
            featuredSpan: sanitized.featuredSpan,
            updatedAt: serverTimestamp(),
          });
        }
      }

      for (const letItem of letters) {
        const safeId = sanitizeId(letItem.id, 'let');
        const letRef = doc(db, 'letters', safeId);
        const letSnap = await getDoc(letRef);
        if (!letSnap.exists()) {
          await createLetterInFirestore({ ...letItem, id: safeId }, ownerUid);
        } else if (!onlyIfEmpty) {
          const sanitized = sanitizeLetterPayload({ ...letItem, id: safeId });
          await updateDoc(letRef, {
            title: sanitized.title,
            date: sanitized.date,
            occasion: sanitized.occasion,
            content: sanitized.content,
            signature: sanitized.signature,
            isPinned: sanitized.isPinned,
            updatedAt: serverTimestamp(),
          });
        }
      }

      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'site_settings/main');
    }
  };

  activeSyncPromise = runSync().finally(() => {
    activeSyncPromise = null;
  });

  return activeSyncPromise;
}

export type { Timestamp };
