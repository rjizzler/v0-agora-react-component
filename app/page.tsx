"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import Features from "@/components/features"
import HowItWorks from "@/components/how-it-works"
import ChatSection from "@/components/chat-section"
import Footer from "@/components/footer"

export default function Home() {
  const [address, setAddress] = useState("")
  const [isConnected, setIsConnected] = useState(false)

  const handleConnect = (inputAddress: string) => {
    if (inputAddress.trim().length > 0) {
      setAddress(inputAddress)
      setIsConnected(true)
    }
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setAddress("")
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Navbar />
      <Hero onConnect={handleConnect} />
      <Features />
      <HowItWorks />
      <ChatSection
        address={address}
        isConnected={isConnected}
        onDisconnect={handleDisconnect}
        onConnect={handleConnect}
      />
      <Footer />
    </div>
  )
}
