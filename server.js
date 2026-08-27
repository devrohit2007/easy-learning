const express = require("express");
const dotenv = require("dotenv");
const multer = require("multer");
dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
app.use(express.json({ limit: "10mb" }));
app.use(express.static(__dirname));

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
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}` },
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
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}` },
      body: JSON.stringify({
        model: "nvidia/llama-3.2-90b-vision-instruct",
        messages: [{ role: "user", content: [
          { type: "text", text: "Extract and return all the text from this image or document. Return only the text, no commentary." },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } }
        ]}],
        max_tokens: 1000
      })
    });
    const d = await r.json();
    const text = d.choices?.[0]?.message?.content || "";
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`EasyLearning running on http://localhost:${PORT}`));
