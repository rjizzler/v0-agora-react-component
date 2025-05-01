"use client"

import type React from "react"

import { useEffect, useState } from "react"
import io from "socket.io-client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MessageCircle, Send, LogIn } from "lucide-react"

// Initialize socket connection
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000")

export default function ChatApp() {
  const [coinAddress, setCoinAddress] = useState("")
  const [joined, setJoined] = useState(false)
  const [chat, setChat] = useState<string[]>([])
  const [message, setMessage] = useState("")
  const [connecting, setConnecting] = useState(false)
  const [sending, setSending] = useState(false)

  // Listen for incoming messages
  useEffect(() => {
    socket.on("message", (msg) => {
      setChat((prev) => [...prev, msg])
    })

    return () => {
      socket.off("message")
    }
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollArea = document.getElementById("message-container")
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight
    }
  }, [chat])

  const joinRoom = () => {
    if (coinAddress.trim() !== "") {
      setConnecting(true)
      socket.emit("join", coinAddress)
      setJoined(true)
      setChat([])
      setConnecting(false)
    }
  }

  const sendMessage = () => {
    if (message.trim() !== "") {
      setSending(true)
      socket.emit("message", { room: coinAddress, text: message })
      setMessage("")
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (!joined) {
        joinRoom()
      } else {
        sendMessage()
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-emerald-50 to-white p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="bg-emerald-500 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            <CardTitle>Crypto Chat</CardTitle>
          </div>
          <CardDescription className="text-emerald-50">
            {joined ? `Connected to ${coinAddress}` : "Join a coin-specific chatroom"}
          </CardDescription>
        </CardHeader>

        {!joined ? (
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="coin-address" className="text-sm font-medium">
                  Coin Address
                </label>
                <Input
                  id="coin-address"
                  placeholder="Enter coin address (e.g., BTC, ETH, SOL)"
                  value={coinAddress}
                  onChange={(e) => setCoinAddress(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="focus-visible:ring-emerald-500"
                />
              </div>
              <Button
                onClick={joinRoom}
                className="w-full bg-emerald-500 hover:bg-emerald-600"
                disabled={connecting || coinAddress.trim() === ""}
              >
                <LogIn className="mr-2 h-4 w-4" />
                {connecting ? "Connecting..." : "Join Chatroom"}
              </Button>
            </div>
          </CardContent>
        ) : (
          <>
            <CardContent className="p-0">
              <ScrollArea id="message-container" className="h-[350px] p-4">
                {chat.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chat.map((msg, i) => (
                      <div key={i} className="p-3 bg-gray-100 rounded-lg">
                        {msg}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <Separator />
            </CardContent>
            <CardFooter className="p-3">
              <div className="flex w-full gap-2">
                <Input
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="focus-visible:ring-emerald-500"
                />
                <Button
                  onClick={sendMessage}
                  className="bg-emerald-500 hover:bg-emerald-600"
                  disabled={sending || message.trim() === ""}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
