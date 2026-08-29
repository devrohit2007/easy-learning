const AI = (() => {

  const SYSTEM_PROMPT = `You are an adaptive learning assistant. Your only job is to explain concepts in different ways until the learner understands.

Rules:
- Be concise. Do not pad responses.
- Do not repeat the original text back.
- Do not say "Great question!" or add filler.
- Format depends on the mode requested.`;

  const MODE_PROMPTS = {
    simple: (text) => `Explain the following concept in simple, plain language. No jargon. Short sentences. Anyone should be able to understand it.\n\nConcept: ${text}`,
    analogy: (text) => `Explain the following concept using a single clear real-world analogy. Make it concrete and relatable. Then briefly explain how the analogy maps to the concept.\n\nConcept: ${text}`,
    visual: (text) => `Explain the following concept as a simple top-to-bottom flow. Use ONLY this format for each step: a label on one line, then an arrow (↓) on the next line. No boxes, no ASCII art, no dashes. End with one sentence summary.\n\nConcept: ${text}`,
    steps: (text) => `Break down the following concept into clear sequential steps. Number each step. Each step should be one sentence. Maximum 6 steps.\n\nConcept: ${text}`
  };

  const PRACTICE_PROMPT = (text) => `Based on this concept, generate exactly 3 multiple-choice practice questions.\n\nConcept: ${text}\n\nReturn ONLY a JSON array, no markdown, no explanation:\n[\n  {\n    "question": "...",\n    "options": ["A", "B", "C", "D"],\n    "correct": 0,\n    "explanation": "..."\n  }\n]\n\ncorrect is the 0-based index of the right answer.`;

  const HIGHLIGHT_PROMPT = (text) => `Read this explanation and identify 3 to 5 key terms that are most important to understand. Return ONLY a JSON array of the terms, no markdown, no explanation:\n["term1", "term2", "term3"]\n\nExplanation: ${text}`;

  const QUIZ_PROMPT = (text) => `Based on this concept, generate exactly 4 multiple-choice quiz questions. These should be slightly harder than practice questions.\n\nConcept: ${text}\n\nReturn ONLY a JSON array, no markdown, no explanation:\n[\n  {\n    "question": "...",\n    "options": ["A", "B", "C", "D"],\n    "correct": 0,\n    "explanation": "..."\n  }\n]\n\ncorrect is the 0-based index of the right answer.`;

  async function callAPI(userMessage, mode = "steps") {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ]
      })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Server error ' + response.status);
    }
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.content;
  }

  async function explain(text, mode, lang = "English", diff = "normal") {
    const prompt = MODE_PROMPTS[mode];
    if (!prompt) throw new Error('Unknown mode: ' + mode);
    const diffNote = diff === "kid" ? "\n\nAudience: Explain like the person is 10 years old. Use very simple words and fun examples." : diff === "expert" ? "\n\nAudience: The person is an expert. Use technical terms, be precise, skip basic explanations." : "";
    const langNote = lang !== "English" ? `\n\nIMPORTANT: Respond entirely in ${lang}. Do not use English except for technical terms that have no translation.` : "";
    return await callAPI(prompt(text) + diffNote + langNote, mode);
  }

  async function generatePractice(text, mode, lang = "English") {
    const langNote = lang !== "English" ? `\n\nIMPORTANT: Write the questions, options, and explanations entirely in ${lang}.` : "";
    const raw = await callAPI(PRACTICE_PROMPT(text) + langNote, mode);
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('Invalid response');
    return JSON.parse(match[0]);
  }

  async function generateQuiz(text, mode, lang = "English") {
    const langNote = lang !== "English" ? `\n\nIMPORTANT: Write the questions, options, and explanations entirely in ${lang}.` : "";
    const raw = await callAPI(QUIZ_PROMPT(text) + langNote, mode);
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('Invalid response');
    return JSON.parse(match[0]);
  }

  async function getKeyTerms(text) {
    const raw = await callAPI(HIGHLIGHT_PROMPT(text), "steps");
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  }

  async function evaluateTeachBack(original, userExplanation) {
    const prompt = `You are evaluating a student's understanding of a concept.

Original concept:
${original}

Student's explanation:
${userExplanation}

Score their explanation out of 10. Return ONLY a JSON object, no markdown:
{
  "score": 7,
  "feedback": "You got the main idea but missed X...",
  "missed": ["point 1", "point 2"],
  "strong": ["point 1"]
}`;
    const raw = await callAPI(prompt, "simple");
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Invalid response");
    return JSON.parse(match[0]);
  }

  return { explain, generatePractice, generateQuiz, getKeyTerms, evaluateTeachBack };

})();
