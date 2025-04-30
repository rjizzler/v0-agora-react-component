"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import io from "socket.io-client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MessageCircle, Send, LogIn, RefreshCw, User } from "lucide-react"
import { generateRandomUsername } from "@/lib/username-utils"

// Initialize socket connection
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000")

// Define message type
interface Message {
  text: string
  username: string
  timestamp: number
}

export default function ChatApp() {
  const [username, setUsername] = useState("")
  const [coinAddress, setCoinAddress] = useState("")
  const [joined, setJoined] = useState(false)
  const [chat, setChat] = useState<Message[]>([])
  const [message, setMessage] = useState("")
  const [connecting, setConnecting] = useState(false)
  const [sending, setSending] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Generate a random username on initial load
  useEffect(() => {
    setUsername(generateRandomUsername())
  }, [])

  // Listen for incoming messages
  useEffect(() => {
    socket.on("message", (msg: { text: string; username: string }) => {
      setChat((prev) => [
        ...prev,
        {
          text: msg.text,
          username: msg.username,
          timestamp: Date.now(),
        },
      ])
    })

    return () => {
      socket.off("message")
    }
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [chat])

  const generateNewRandomUsername = () => {
    setUsername(generateRandomUsername())
  }

  const joinRoom = () => {
    if (coinAddress.trim() !== "") {
      setConnecting(true)
      socket.emit("join", { room: coinAddress, username })
      setJoined(true)
      setChat([])
      setTimeout(() => setConnecting(false), 500) // Add slight delay for better UX
    }
  }

  const sendMessage = () => {
    if (message.trim() !== "") {
      setSending(true)
      const messageData = {
        room: coinAddress,
        text: message,
        username,
      }
      socket.emit("message", messageData)

      // Add the message to the chat immediately for better UX
      setChat((prev) => [
        ...prev,
        {
          text: message,
          username,
          timestamp: Date.now(),
        },
      ])

      setMessage("")
      setTimeout(() => setSending(false), 300) // Add slight delay for better UX
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

  // Format timestamp for display
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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
            {joined ? `Connected to ${coinAddress} as ${username}` : "Join a coin-specific chatroom"}
          </CardDescription>
        </CardHeader>

        {!joined ? (
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-500" />
                  Your Display Name
                </label>
                <div className="flex gap-2">
                  <Input
                    id="username"
                    placeholder="Your display name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="focus-visible:ring-emerald-500"
                  />
                  <Button
                    onClick={generateNewRandomUsername}
                    variant="outline"
                    className="border-gray-200 hover:bg-gray-50"
                    title="Generate random name"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="coin-address" className="text-sm font-medium">
                  Coin Address
                </label>
                <Input
                  id="coin-address"
                  placeholder="Enter CA"
                  value={coinAddress}
                  onChange={(e) => setCoinAddress(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="focus-visible:ring-emerald-500"
                />
              </div>
              <Button
                onClick={joinRoom}
                className="w-full bg-emerald-500 hover:bg-emerald-600"
                disabled={connecting || coinAddress.trim() === "" || username.trim() === ""}
              >
                <LogIn className="mr-2 h-4 w-4" />
                {connecting ? "Connecting..." : "Join Chatroom"}
              </Button>
            </div>
          </CardContent>
        ) : (
          <>
            <CardContent className="p-0">
              <ScrollArea ref={scrollAreaRef} className="h-[350px] p-4">
                {chat.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chat.map((msg, i) => (
                      <div key={i} className="p-3 bg-gray-100 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-emerald-600">{msg.username}</span>
                          <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
                        </div>
                        <p className="text-gray-800">{msg.text}</p>
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
