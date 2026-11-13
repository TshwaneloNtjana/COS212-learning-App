/** "13 Nov, 15:42" */
export function formatDateTime(iso: string) {
  const d = new Date(iso)
  return `${d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}, ${d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}`
}

/** "Today", "Yesterday" or "13 Nov" */
export function formatDay(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
}

/** "4 min" or "45 s" */
export function formatDuration(seconds: number) {
  return seconds < 60 ? `${seconds} s` : `${Math.round(seconds / 60)} min`
}
