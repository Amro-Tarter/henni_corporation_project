import { badWords } from '/src/components/chat/utils/badWords.js';

const bannedEmojis = ['🖕'];

export function containsBadWord(text) {
  if (!text) return false;
  const normalized = text
    .toLowerCase()
    .replace(/[^\w\u0590-\u05FF]+/g, ' '); // English & Hebrew word chars
  // Check for bad words
  const words = normalized.split(' ');
  const hasBadWord = badWords.some(word => words.includes(word));

  // Check for banned emojis in original (unfiltered) text
  const hasBannedEmoji = bannedEmojis.some(emoji => text.includes(emoji));

  return hasBadWord || hasBannedEmoji;
}
