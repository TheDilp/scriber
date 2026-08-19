export function formatDateStringToDateTime(date: string): string {
  const dated = new Date(date);

  return `${dated.getDate()}.${dated.getMonth()}.${dated.getFullYear()}. ${dated.getHours()}:${dated.getMinutes()}`;
}
