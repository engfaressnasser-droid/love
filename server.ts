import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'store.json');
const UPLOADS_DIR = path.resolve(__dirname, 'public', 'uploads');

// Ensure storage directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface StoreData {
  profile: any;
  memories: any[];
  letters: any[];
  updatedAt: string;
}

function loadData(): StoreData | null {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Failed to load store.json:', err);
  }
  return null;
}

function saveData(data: Partial<StoreData>) {
  try {
    const existing = loadData() || {
      profile: null,
      memories: [],
      letters: [],
      updatedAt: new Date().toISOString(),
    };
    const merged: StoreData = {
      profile: data.profile !== undefined ? data.profile : existing.profile,
      memories: Array.isArray(data.memories) ? data.memories : (existing.memories || []),
      letters: Array.isArray(data.letters) ? data.letters : (existing.letters || []),
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(merged, null, 2), 'utf-8');
    return merged;
  } catch (err) {
    console.error('Failed to save store.json:', err);
    throw err;
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Support JSON and large payloads for uploaded images
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Serve static uploaded files
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Serve static public assets with proper audio MIME types
  app.use(express.static(path.resolve(__dirname, 'public'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.mpeg') || filePath.endsWith('.mp3')) {
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Accept-Ranges', 'bytes');
      }
    },
  }));

  // --- API Endpoints ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get all data
  app.get('/api/data', (req, res) => {
    const data = loadData();
    res.json({
      success: true,
      data: data || null,
    });
  });

  // Save all or partial data
  app.post('/api/save', (req, res) => {
    try {
      const { profile, memories, letters } = req.body;
      const updated = saveData({ profile, memories, letters });
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Upload an image (base64 data URL) and save to /uploads/
  app.post('/api/upload', (req, res) => {
    try {
      const { dataUrl, filename } = req.body;
      if (!dataUrl || !dataUrl.startsWith('data:image/')) {
        return res.status(400).json({ success: false, error: 'Invalid data URL' });
      }

      const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ success: false, error: 'Malformed image data' });
      }

      const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1].replace('+xml', '');
      const base64Data = matches[2];
      const safePrefix = (filename || 'photo').replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 30);
      const uniqueName = `${safePrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const filePath = path.join(UPLOADS_DIR, uniqueName);

      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

      // Serve path relative to public/
      const publicUrl = `/uploads/${uniqueName}`;
      res.json({ success: true, url: publicUrl });
    } catch (err: any) {
      console.error('Upload error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Export full backup
  app.get('/api/backup/export', (req, res) => {
    const data = loadData();
    res.setHeader('Content-Disposition', 'attachment; filename="hikayatuna-backup.json"');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data, null, 2));
  });

  // Restore backup
  app.post('/api/backup/restore', (req, res) => {
    try {
      const { backup } = req.body;
      if (!backup || typeof backup !== 'object') {
        return res.status(400).json({ success: false, error: 'Invalid backup format' });
      }
      const updated = saveData({
        profile: backup.profile,
        memories: backup.memories,
        letters: backup.letters,
      });
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware in dev or static files in prod
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Express + Vite] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
