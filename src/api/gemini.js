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

const TOPIC_PROMPT = `
Categorize this question and answer pair into a single-word topic.
Examples: Tech, Science, History, Philosophy, Nature, Math, Art, Culture, Language, Medicine, Physics, Chemistry, Biology, Astronomy, Psychology, Economics, Politics, Literature, Music, Sports, Food, Geography, Religion, Mythology, Engineering, Computer, AI, Space, Earth, Human, Animal, Plant, Material, Energy, Time, Space, Logic, Theory, Practice, Ancient, Modern, Future, Abstract, Concrete.

Return ONLY a single word, no punctuation, capitalized first letter.
`;

export async function categorizeEntry(question, answer) {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: TOPIC_PROMPT,
    });

    const prompt = `Question: ${question}\nAnswer: ${answer}\n\nTopic:`;
    const result = await model.generateContent(prompt);
    const topic = result.response.text().trim().split(/\s+/)[0];
    
    // Clean and capitalize first letter
    const cleaned = topic.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  } catch (e) {
    console.error('Topic categorization failed:', e);
    return 'Misc';
  }
}

