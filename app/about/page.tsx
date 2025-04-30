import Link from "next/link"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="flex items-center justify-between px-8 py-6 bg-gray-800 shadow-md sticky top-0 z-50">
        <Link href="/" className="flex items-center space-x-3">
          <Image src="/assets/LoquiLogo.png" alt="Loqui Logo" width={40} height={40} />
          <h1 className="text-2xl font-bold text-red-500">Loqui</h1>
        </Link>
        <nav className="space-x-4">
          <Link href="/about" className="text-red-400">
            About
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 shadow-lg">
          <h1 className="text-4xl font-bold mb-8 text-center text-red-400">About Loqui</h1>

          <div className="space-y-6 text-gray-300">
            <p className="text-lg">
              Loqui is a decentralized conversation platform that connects users through blockchain. By entering any
              Solana-compatible contract address, users can instantly access or create a dedicated chatroom tied to that
              contract. Whether you're a trader, developer, investor, or curious observer, Loqui makes it easy to engage
              in live, community-driven discussions about the tokens and projects you care about.
            </p>

            <p className="text-lg">
              We believe that blockchain projects deserve more than just charts and forums — they deserve real-time
              communication. Loqui empowers transparency, collaboration, and dialogue directly around smart contracts,
              helping communities form and thrive organically.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4 text-white">
              Built for speed, privacy, and scalability, Loqui offers:
            </h2>

            <ul className="space-y-4 list-none pl-0">
              <li className="flex items-start">
                <span className="text-xl mr-3">🔐</span>
                <span>End-to-end encrypted chats</span>
              </li>
              <li className="flex items-start">
                <span className="text-xl mr-3">⚡</span>
                <span>Real-time message delivery</span>
              </li>
              <li className="flex items-start">
                <span className="text-xl mr-3">🧠</span>
                <span>Crowd-driven insights and feedback</span>
              </li>
              <li className="flex items-start">
                <span className="text-xl mr-3">🪪</span>
                <span>No sign-ups required — just jump in via contract</span>
              </li>
            </ul>

            <p className="text-xl font-medium text-center mt-8 text-red-400">
              Join the future of decentralized dialogue — one contract at a time.
            </p>

            <div className="flex justify-center mt-8">
              <Link
                href="/"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 border-t border-gray-700 py-6 text-center text-sm text-gray-500 mt-16">
        <p>
          Built with ❤️ by the Loqui team! •{" "}
          <a href="#" className="hover:underline">
            Privacy
          </a>{" "}
          •{" "}
          <a href="#" className="hover:underline">
            Terms
          </a>
        </p>
      </footer>
    </div>
  )
}
