/**
 * Форматирует дату в формат ДД.ММ.ГГГГ
 * @param {string|Date} dateStr — строка даты или объект Date
 * @returns {string} — дата в формате ДД.ММ.ГГГГ или пустая строка
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}
