# EasyLearning

> **Paste anything. Understand it your way. Prove you actually got it.**

Live demo: https://easy-learning-six.vercel.app
Source code: https://github.com/devrohit2007/easy-learning

---

## The problem

Most AI tutors explain once and stop. If it doesn't click, you're stuck rereading the same words. Nothing ever checks whether you understood — only whether you read.

## The solution

EasyLearning is an adaptive AI learning tool that explains any concept in the style that works for you, generates practice and a quiz, then proves understanding by making you teach it back — and scores your explanation.

## Why it's different

Every other tool stops at the explanation. EasyLearning doesn't stop until you can teach it. After a failed quiz, instead of re-explaining, it asks you to explain the concept back in your own words. An AI scores your explanation and tells you exactly what you got right and what you missed.

---

## AI Architecture

| Task | Model |
|---|---|
| Simple / Analogy explanations, Teach-it-Back scoring | Gemini 3.6 Flash |
| Visual / Step-by-step, Practice and Quiz generation | NVIDIA Nemotron 3 Ultra |
| PDF / image text extraction | NVIDIA Llama 3.2 Vision |
| Key-term definitions | Groq gpt-oss-20b (~100ms) |

Also uses YouTube Data API and Wikipedia API for real external sources.

---

## Features

- 4 explanation modes: Simple, Analogy, Visual, Step-by-step
- Difficulty levels: Kid, Student, Expert
- Languages: English, Hindi, Tamil
- Streaming responses — text appears word by word
- Practice and Quiz pre-fetched in the background while you read
- Teach it Back — the feature no other tool has
- Voice input, PDF and photo upload, instant term definitions
- YouTube and Wikipedia integration
- Recent history

---

## Tech stack

Node.js, Express, Vercel, pdf-parse, Vanilla HTML/CSS/JS

---

## Running locally

Clone the repo, run npm install, create a .env with your API keys (GEMINI_API_KEY, NVIDIA_NEMOTRON_KEY, NVIDIA_VISION_KEY, GROQ_API_KEY, FEATHERLESS_API_KEY, YOUTUBE_API_KEY), then run node server.js and visit localhost:3000

---

## Built by

Rohit — built entirely on Android via Termux, no PC or Android Studio used.
