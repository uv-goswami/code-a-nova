// Escapes user-supplied text before it is placed inside HTML emails (prevents HTML injection).
const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const escapeHtml = (value: unknown): string => String(value ?? '').replace(/[&<>"']/g, (ch) => map[ch]);
