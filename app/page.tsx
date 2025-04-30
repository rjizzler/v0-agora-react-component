"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export default function HomePage() {
  const [contract, setContract] = useState("")

  const handleStartChat = () => {
    if (contract) {
      window.location.href = `/chat/${contract}`
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && contract) {
      handleStartChat()
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="flex items-center justify-between px-8 py-6 bg-gray-800 shadow-md sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Image src="/assets/LoquiLogo.png" alt="Loqui Logo" width={40} height={40} />
          <h1 className="text-2xl font-bold text-red-500">Loqui</h1>
        </div>
        <nav className="space-x-4">
          <a href="#" className="text-gray-300 hover:text-red-400">
            About
          </a>
        </nav>
      </header>

      <main className="flex flex-col items-center justify-center px-4 py-20">
        <h2 className="text-4xl font-bold mb-4 text-center">Join the Conversation by Contract</h2>
        <p className="text-lg text-center max-w-2xl mb-8 text-gray-300">
          Enter any Ethereum-compatible contract address and start chatting with fellow holders, traders, and
          developers.
        </p>
        <div className="flex space-x-2 w-full max-w-xl">
          <Input
            placeholder="Enter Contract Address..."
            value={contract}
            onChange={(e) => setContract(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 bg-gray-800 text-white border border-gray-700"
          />
          <Button
            onClick={handleStartChat}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={!contract.trim()}
          >
            Start Chat
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-gray-800 border border-gray-700">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-semibold mb-2 text-red-400">🔒 Secure & Private</h3>
              <p className="text-gray-300">End-to-end encrypted chat with no stored user data.</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border border-gray-700">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-semibold mb-2 text-red-400">🧠 Community-Driven</h3>
              <p className="text-gray-300">Talk directly with people engaged in the same contracts.</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border border-gray-700">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-semibold mb-2 text-red-400">⚡ Fast & Scalable</h3>
              <p className="text-gray-300">Real-time messaging powered by modern web tech.</p>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="bg-gray-800 border-t border-gray-700 py-6 text-center text-sm text-gray-500">
        <p>
          Built by the Loqui Team! •{" "}
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
