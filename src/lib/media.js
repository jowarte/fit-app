export function getMediaUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('/midia/')) {
    return `https://appgood.online${encodeURI(trimmed)}`;
  }
  if (trimmed.startsWith('midia/')) {
    return `https://appgood.online/${encodeURI(trimmed)}`;
  }
  return trimmed;
}
