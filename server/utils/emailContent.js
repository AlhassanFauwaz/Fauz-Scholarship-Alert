export const truncateWords = (value, maxWords) => {
  const words = String(value || '').trim().split(/\s+/).filter(Boolean);
  return words.length > maxWords
    ? `${words.slice(0, maxWords).join(' ')}…`
    : words.join(' ');
};

export const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');
