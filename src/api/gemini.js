import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. Ensure your .env has EXPO_PUBLIC_GEMINI_API_KEY
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

const SYSTEM_PROMPT = `
### ROLE
You are a precision discovery engine for "nerd.".

### CONSTRAINTS
- **Direct Answer**: Provide ONLY the direct, literal answer. No sentences, no punctuation, max 3 words.
- **Rabbit Holes**: Provide a dynamic list of 2 to 3 follow-up questions.
- **Rabbit Hole Length**: Keep each question extremely short.
- **Tone**: Clinical, raw, and high-signal.

### OUTPUT SCHEMA
Return ONLY valid JSON:
{
  "answer": "one or two word answer",
  "rabbit_holes": ["very short q1", "very short q2", "very short q3"],
  "topic": "single word category like Tech, Science, History, Philosophy, Nature, Math, Art, etc."
}
`;

function parseResponseText(text) {
  let raw = (text || '').trim();
  // Remove markdown code fences if Gemini adds them
  raw = raw.replace(/```json|```/g, '').trim();

  try {
    const parsed = JSON.parse(raw);
    const topic = parsed.topic 
      ? String(parsed.topic).charAt(0).toUpperCase() + String(parsed.topic).slice(1).toLowerCase()
      : 'Misc';
    
    return {
      answer: String(parsed.answer || '')
        .toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ''),
      rabbit_holes: Array.isArray(parsed.rabbit_holes)
        ? parsed.rabbit_holes
        : [],
      topic: topic,
    };
  } catch (_) {
    return { answer: text.split('\n')[0], rabbit_holes: [], topic: 'Misc' };
  }
}

export async function askNerdRot(question) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({
    model: 'gemini-flash-latest',
    systemInstruction: SYSTEM_PROMPT,
  });

  const result = await model.generateContent(question);
  const responseText = result.response.text();
  return parseResponseText(responseText);
}

