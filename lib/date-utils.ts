/**
 * Formats a timestamp into a readable time string
 * @param timestamp - The timestamp in milliseconds
 * @returns A formatted time string (e.g., "10:30 AM" or "Yesterday, 2:45 PM")
 */
export function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()

  // Check if the message was sent today
  const isToday = date.toDateString() === now.toDateString()

  // Check if the message was sent yesterday
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()

  // Format the time (e.g., "10:30 AM")
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }
  const timeString = date.toLocaleTimeString(undefined, timeOptions)

  // Return the appropriate formatted string
  if (isToday) {
    return timeString
  } else if (isYesterday) {
    return `Yesterday, ${timeString}`
  } else {
    // Format the date (e.g., "Apr 15")
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    }
    const dateString = date.toLocaleDateString(undefined, dateOptions)
    return `${dateString}, ${timeString}`
  }
}
