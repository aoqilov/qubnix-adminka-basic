/** Foizdagi o'zgarish: (joriy − oldingi) / oldingi. Oldingisi 0 yoki yo'q bo'lsa — null. */
export function percentChange(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous === 0) return null;
  return (current - previous) / Math.abs(previous);
}
