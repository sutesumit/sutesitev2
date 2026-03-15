export function toKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  const slots: (number | null)[] = [
    ...Array(first).fill(null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];
  while (slots.length < 42) slots.push(null);
  return Array.from({ length: 6 }, (_, i) => slots.slice(i * 7, i * 7 + 7));
}

export function densityLevel(n: number) {
  if (n === 0) return 0;
  if (n <= 2) return 1;
  if (n <= 6) return 2;
  if (n <= 12) return 3;
  if (n <= 20) return 4;
  return 5;
}
