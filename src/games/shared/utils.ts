export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function findSecondHighestDay(
  data: Record<string, number>,
  year: number,
  month: number
): number {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const contributions: { day: number; count: number }[] = []

  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    const count = data[key] ?? 0
    if (count > 0) {
      contributions.push({ day, count })
    }
  }

  if (contributions.length === 0) {
    return 0
  }

  contributions.sort((a, b) => b.count - a.count)

  if (contributions.length === 1) {
    return contributions[0].day
  }

  return contributions[1].day
}
