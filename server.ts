import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";

const app = express();
const PORT = 3000;

app.use(express.json());

const dataPath = path.join(process.cwd(), 'data.json');

async function readData() {
  try {
    const data = await fs.readFile(dataPath, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      const initialData = { videos: [] };
      await fs.writeFile(dataPath, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    throw error;
  }
}

async function writeData(data: any) {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
}

// API Routes
app.get("/api/videos", async (req, res) => {
  try {
    const data = await readData();
    const query = (req.query.q as string)?.toLowerCase() || '';
    
    let videos = data.videos;
    if (query) {
      videos = videos.filter((v: any) => 
        v.title.toLowerCase().includes(query) || 
        v.keywords.some((k: string) => k.toLowerCase().includes(query))
      );
    }
    
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: "Failed to read videos" });
  }
});

app.post("/api/videos", async (req, res) => {
  try {
    const { url, title, keywords } = req.body;
    if (!url || !title) {
      return res.status(400).json({ error: "URL and title are required" });
    }

    // Extract YouTube video ID
    const urlObj = new URL(url);
    let videoId = '';
    if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v') || '';
    } else if (urlObj.hostname.includes('youtu.be')) {
      videoId = urlObj.pathname.slice(1);
    }

    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    const data = await readData();
    const newVideo = {
      id: crypto.randomUUID(),
      youtubeId: videoId,
      url,
      title,
      keywords: keywords || [],
      createdAt: new Date().toISOString()
    };
    
    data.videos.push(newVideo);
    await writeData(data);
    
    res.status(201).json(newVideo);
  } catch (error) {
    res.status(500).json({ error: "Failed to save video" });
  }
});

app.delete("/api/videos/:id", async (req, res) => {
  try {
    const data = await readData();
    data.videos = data.videos.filter((v: any) => v.id !== req.params.id);
    await writeData(data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete video" });
  }
});

app.put("/api/videos/:id/keywords", async (req, res) => {
  try {
    const { keywords } = req.body;
    const data = await readData();
    const videoIndex = data.videos.findIndex((v: any) => v.id === req.params.id);
    
    if (videoIndex === -1) {
      return res.status(404).json({ error: "Video not found" });
    }
    
    data.videos[videoIndex].keywords = keywords || [];
    await writeData(data);
    
    res.json(data.videos[videoIndex]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update video keywords" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
