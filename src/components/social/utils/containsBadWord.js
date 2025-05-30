import { badWords } from '/src/components/chat/utils/badWords.js';

export function containsBadWord(text) {
  if (!text) return false;
  const normalized = text
    .toLowerCase()
    .replace(/[^\w\u0590-\u05FF]+/g, ' '); // English & Hebrew word chars
  return badWords.some(word =>
    normalized.split(' ').includes(word)
  );
}
