function getDirection(text) {
  if (!text) return 'ltr';
  // Check for any Hebrew character
  return /[\u0590-\u05FF]/.test(text) ? 'rtl' : 'ltr';
}

export default getDirection;
