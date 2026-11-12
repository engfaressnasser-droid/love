import { CoupleProfile, MemoryItem, LoveLetter } from './memoriesLogic';

export interface RemoteData {
  profile: CoupleProfile | null;
  memories: MemoryItem[] | null;
  letters: LoveLetter[] | null;
  updatedAt?: string;
}

/**
 * Uploads a base64 image data URL to the server and returns the public static URL.
 * If upload fails or if dataUrl is already a regular URL, returns the original URL.
 */
export async function uploadImageToServer(dataUrl: string, filename?: string): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dataUrl,
        filename: filename || 'romantic_photo',
      }),
    });

    if (!res.ok) {
      throw new Error(`Upload failed with status ${res.status}`);
    }

    const result = await res.json();
    if (result.success && result.url) {
      return result.url;
    }
  } catch (err) {
    console.warn('Failed to upload image to server, using local dataUrl fallback:', err);
  }

  return dataUrl;
}

/**
 * Fetches all saved data from the server.
 */
export async function fetchServerData(): Promise<RemoteData | null> {
  try {
    const res = await fetch('/api/data', { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
  } catch (err) {
    console.warn('Could not fetch server data, falling back to local storage:', err);
  }
  return null;
}

/**
 * Persists data (profile, memories, letters) to the server.
 */
export async function saveServerData(data: {
  profile?: CoupleProfile;
  memories?: MemoryItem[];
  letters?: LoveLetter[];
}): Promise<boolean> {
  try {
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) return false;
    const json = await res.json();
    return !!json.success;
  } catch (err) {
    console.warn('Could not save data to server:', err);
    return false;
  }
}
