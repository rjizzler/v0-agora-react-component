"use client"

import type React from "react"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface HeroProps {
  onConnect: (address: string) => void
}

export default function Hero({ onConnect }: HeroProps) {
  const [inputAddress, setInputAddress] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConnect(inputAddress)

    // Scroll to chat section
    const chatSection = document.getElementById("chat")
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section
      className="h-screen flex flex-col justify-center items-center text-center px-4 relative overflow-hidden"
      style={{ background: "linear-gradient(to bottom right, #1E1E1E, #000)" }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-red-500"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="z-10 max-w-3xl">
        <h2 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 mb-4 animate-fade-in">
          Welcome to AGORA
        </h2>
        <p className="text-lg md:text-xl max-w-xl mx-auto mb-8 text-gray-300">
          Where conversation meets code. Enter a decentralized chatroom by address and speak freely.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input
            type="text"
            placeholder="Enter coin or contract address"
            value={inputAddress}
            onChange={(e) => setInputAddress(e.target.value)}
            className="bg-[#1E1E1E] border-red-600/50 focus:border-red-500 text-white"
            required
          />
          <Button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold transition duration-300 flex items-center gap-2"
          >
            Enter Chat <ArrowRight size={16} />
          </Button>
        </form>
      </div>
    </section>
  )
}
