/**
 * Optimizes an image (resizes and compresses to clean JPEG)
 * so that uploaded photos stay crisp and always fit safely within
 * cloud Firestore document size limits (< 450 KB) across all phones and shared links.
 */
export async function optimizeImage(
  fileOrDataUrl: File | string,
  maxDimension = 1280,
  quality = 0.84,
  maxBytes = 420_000
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      const renderAt = (dim: number, q: number): string => {
        let width = img.width;
        let height = img.height;

        if (width > dim || height > dim) {
          if (width > height) {
            height = Math.round((height * dim) / width);
            width = dim;
          } else {
            width = Math.round((width * dim) / height);
            height = dim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '';
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', q);
      };

      // First pass
      let optimized = renderAt(maxDimension, quality);

      // Step down quality / resolution only if needed to guarantee Firestore 1MB safety
      const fallbackSteps: Array<[number, number]> = [
        [maxDimension, 0.7],
        [960, 0.68],
        [800, 0.6],
        [640, 0.52],
      ];

      for (const [dim, q] of fallbackSteps) {
        if (optimized.length <= maxBytes) break;
        optimized = renderAt(dim, q);
      }

      resolve(optimized);
    };

    img.onerror = () => {
      resolve(typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '');
    };

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          img.src = e.target.result;
        } else {
          resolve('');
        }
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}

/**
 * Converts a local container upload URL (e.g. /uploads/...) to a compressed
 * cloud-portable JPEG data URL when migrating local photos into Firestore.
 */
export async function ensurePortableImageUrl(url: string): Promise<string> {
  if (!url) return url;
  if (url.startsWith('/uploads/')) {
    try {
      const res = await fetch(url);
      if (!res.ok) return url;
      const blob = await res.blob();
      const file = new File([blob], 'migrated.jpg', { type: blob.type || 'image/jpeg' });
      const dataUrl = await optimizeImage(file);
      return dataUrl || url;
    } catch {
      return url;
    }
  }
  if (url.startsWith('data:image/') && url.length > 450_000) {
    return optimizeImage(url);
  }
  return url;
}
