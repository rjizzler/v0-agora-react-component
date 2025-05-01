/**
 * Generates a random alphanumeric username of specified length
 * @param length The length of the username to generate (default: 16)
 * @returns A random alphanumeric string
 */
export function generateRandomUsername(length = 16): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result += characters.charAt(randomIndex)
  }

  return result
}
