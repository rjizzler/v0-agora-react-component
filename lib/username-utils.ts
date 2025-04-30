// List of adjectives for username generation
const adjectives = [
  "Happy",
  "Brave",
  "Clever",
  "Swift",
  "Mighty",
  "Gentle",
  "Wise",
  "Bold",
  "Calm",
  "Eager",
  "Fierce",
  "Jolly",
  "Lucky",
  "Noble",
  "Proud",
  "Quick",
  "Smart",
  "Witty",
  "Zesty",
  "Bright",
  "Crypto",
  "Digital",
  "Token",
  "Block",
  "Chain",
]

// List of crypto-related nouns for username generation
const cryptoNouns = [
  "Trader",
  "Miner",
  "Holder",
  "Whale",
  "Bull",
  "Bear",
  "Coin",
  "Token",
  "Block",
  "Chain",
  "Wallet",
  "Key",
  "Hash",
  "Node",
  "Ledger",
  "Crypto",
  "Satoshi",
  "Ether",
  "Doge",
  "Bit",
]

/**
 * Generates a random username by combining an adjective and a crypto-related noun
 * @returns A random username string
 */
export function generateRandomUsername(): string {
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const randomNoun = cryptoNouns[Math.floor(Math.random() * cryptoNouns.length)]

  return `${randomAdjective}${randomNoun}`
}
