const express = require("express");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");
dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname)));

app.post("/api/chat", async (req, res) => {
  const { messages, mode } = req.body;
  const useGemini = ["simple", "analogy"].includes(mode);
  try {
    if (useGemini) {
      const contents = messages.filter(m => m.role !== "system").map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents })
      });
      const d = await r.json();
      const content = d.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
      res.json({ content, model: "gemini" });
    } else {
      const r = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.NVIDIA_NEMOTRON_KEY}` },
        body: JSON.stringify({ model: "nvidia/nemotron-3-ultra-550b-a55b", messages, max_tokens: 800, temperature: 0.7 })
      });
      const d = await r.json();
      const content = d.choices?.[0]?.message?.content || "No response.";
      res.json({ content, model: "nemotron" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const base64 = file.buffer.toString("base64");
    const mimeType = file.mimetype;
    const r = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.NVIDIA_VISION_KEY}` },
      body: JSON.stringify({
        model: "meta/llama-3.2-11b-vision-instruct",
        messages: [{ role: "user", content: [
          { type: "text", text: "Extract and return all the text from this image or document. Return only the text, no commentary." },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } }
        ]}],
        max_tokens: 1000
      })
    });
    const raw = await r.text();
    console.log("NVIDIA raw response:", raw.slice(0, 500));
    const d = JSON.parse(raw);
    const text = d.choices?.[0]?.message?.content || "";
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/youtube", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing query" });
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=2&key=${process.env.YOUTUBE_API_KEY}`;
    const r = await fetch(url);
    const data = await r.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const videos = (data.items || []).map(item => ({
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium.url,
      videoId: item.id.videoId,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));
    res.json({ videos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/define", async (req, res) => {
  const { term, context } = req.body;
  if (!term) return res.status(400).json({ error: "Missing term" });
  try {
    const r = await fetch("https://api.featherless.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.FEATHERLESS_API_KEY}`
      },
      body: JSON.stringify({
        model: "Qwen/Qwen3.8-27B",
        messages: [{
          role: "user",
          content: `Define the term "${term}" in one or two short sentences, in the context of: ${context || "general learning"}. Be concise and clear. Return only the definition, no extra text.`
        }],
        max_tokens: 150,
        temperature: 0.3
      })
    });
    const data = await r.json();
    const definition = data.choices?.[0]?.message?.content?.trim();
    if (!definition) throw new Error("No definition returned");
    res.json({ definition });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/wikipedia", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing query" });
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=1`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const title = searchData.query?.search?.[0]?.title;
    if (!title) return res.json({ found: false });

    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const summaryRes = await fetch(summaryUrl);
    const summaryData = await summaryRes.json();

    res.json({
      found: true,
      title: summaryData.title,
      extract: summaryData.extract,
      url: summaryData.content_urls?.desktop?.page,
      thumbnail: summaryData.thumbnail?.source
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EasyLearning running on http://0.0.0.0:${PORT}`);
  });
}
