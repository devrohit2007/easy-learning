# EasyLearning

**Paste anything. Understand it your way.**

EasyLearning is an AI-powered learning tool that adapts explanations to how *you* actually learn — your level, your language, and your preferred style — then proves you understood it, not just read it.

Built for the Prometheus September AI Challenge 2026.

🔗 **Live demo:** https://easy-learning-six.vercel.app

---

## The problem

Most AI tutors give one explanation and stop. If you didn't get it, you're stuck rereading the same words. And most tools never actually check whether you *understood* the concept — they just assume reading equals learning.

## What EasyLearning does differently

**1. Choose how it's explained**
Four distinct modes for any concept — Simple, Analogy, Visual (diagram), or Step-by-step — switch between them instantly if one doesn't click.

**2. Choose your level and language**
Kid, Student, or Expert — the explanation depth changes accordingly. Full support for English, Hindi, and Tamil across explanations, practice questions, and quizzes.

**3. Practice, then get quizzed**
Auto-generated practice questions to warm up, then a harder quiz to test real understanding — with instant feedback and explanations for every answer.

**4. Teach it back**
If you score low on the quiz, EasyLearning doesn't just re-explain — it asks *you* to explain the concept back in your own words, then an AI scores your explanation and tells you exactly what you got right and what you missed. This is the core idea: understanding isn't proven by reading, it's proven by explaining.

**5. Go deeper, without leaving the app**
Stuck on a specific term? Tap it for an instant AI-generated definition in context. Want to see it explained differently? One tap pulls relevant YouTube videos or a Wikipedia summary on the exact topic you're studying.

**6. Get material in however you have it**
Paste text, speak it with voice input, or upload a PDF / photo of your notes — EasyLearning extracts the text and works from there.

---

## How AI is used (not just bolted on)

EasyLearning routes different tasks to different models based on what each is actually good at, rather than sending everything to one API:

| Task | Model | Why |
|---|---|---|
| Simple / Analogy explanations, Teach-it-Back scoring | **Gemini** | Fast, natural language, ideal for quick conversational responses |
| Visual / Step-by-step explanations, Practice & Quiz generation | **NVIDIA Nemotron 3 Ultra** | Stronger structured reasoning for breaking concepts into steps and writing well-calibrated quiz questions |
| PDF / image text extraction | **NVIDIA Llama 3.2 Vision** | Purpose-built for reading text out of images |
| Key-term definitions | **Qwen3.8-27B (via Featherless AI)** | Fast, accurate definitions for both everyday and technical terms — dictionary APIs consistently failed on specialized vocabulary |

Two more integrations ground the app in the real world instead of relying purely on generated text:
- **YouTube Data API** — real, relevant videos on the exact topic being studied
- **Wikipedia API** — a genuine external summary and source link, not just more AI-generated text

---

## Tech stack

- **Frontend:** Vanilla HTML / CSS / JavaScript — no framework overhead
- **Backend:** Node.js + Express
- **Deployment:** Vercel
- **PDF parsing:** pdf-parse

---

## Running locally

```bash
git clone https://github.com/devrohit2007/easy-learning.git
cd easy-learning
npm install
```

Create a `.env` file with:
```
GEMINI_API_KEY=your_key
NVIDIA_NEMOTRON_KEY=your_key
NVIDIA_VISION_KEY=your_key
FEATHERLESS_API_KEY=your_key
YOUTUBE_API_KEY=your_key
```

```bash
node server.js
```

Visit `http://localhost:3000`

---

## Built by

Rohit — built entirely on Android via Termux, no PC or Android Studio used.
