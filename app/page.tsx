"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import io from "socket.io-client"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MessageCircle, Send, LogIn, ArrowRight, Clock, Smile, RefreshCw, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatMessageTime } from "@/lib/date-utils"
import { generateRandomUsername } from "@/lib/username-utils"
import dynamic from "next/dynamic"

// Dynamically import EmojiPicker to avoid SSR issues
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false })

// Initialize socket connection
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000")

// Define message type
interface Message {
  text: string
  timestamp: number
  username: string
}

export default function ChatApp() {
  const [username, setUsername] = useState("")
  const [usernameSet, setUsernameSet] = useState(false)
  const [coinAddress, setCoinAddress] = useState("")
  const [joined, setJoined] = useState(false)
  const [chat, setChat] = useState<Message[]>([])
  const [message, setMessage] = useState("")
  const [connecting, setConnecting] = useState(false)
  const [sending, setSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const emojiButtonRef = useRef<HTMLButtonElement>(null)

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

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showEmojiPicker && emojiButtonRef.current && !emojiButtonRef.current.contains(event.target as Node)) {
        const emojiPicker = document.querySelector(".emoji-picker-react")
        if (emojiPicker && !emojiPicker.contains(event.target as Node)) {
          setShowEmojiPicker(false)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showEmojiPicker])

  const generateNewRandomUsername = () => {
    setUsername(generateRandomUsername())
  }

  const confirmUsername = () => {
    if (username.trim() !== "") {
      setUsernameSet(true)
    }
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
      setShowEmojiPicker(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (!usernameSet) {
        confirmUsername()
      } else if (!joined) {
        joinRoom()
      } else {
        sendMessage()
      }
    }
  }

  const handleEmojiClick = (emojiData: any) => {
    setMessage((prev) => prev + emojiData.emoji)
  }

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev)
  }

  const resetChat = () => {
    setJoined(false)
    setUsernameSet(false)
    setCoinAddress("")
    setChat([])
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-emerald-50/50 to-white p-4 sm:p-6">
      <Card className="w-full max-w-lg shadow-lg border-emerald-100">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-t-xl p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold tracking-tight">Crypto Chat</h2>
              <p className="text-emerald-50/90 text-sm mt-0.5">
                {joined
                  ? `Connected to ${coinAddress} as ${username}`
                  : usernameSet
                    ? "Join a coin-specific chatroom"
                    : "Choose your display name"}
              </p>
            </div>
            {joined && (
              <button
                onClick={resetChat}
                className="text-xs bg-white/20 hover:bg-white/30 transition-colors px-2 py-1 rounded"
              >
                Leave
              </button>
            )}
          </div>
        </CardHeader>

        {!usernameSet ? (
          <CardContent className="p-6 sm:p-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">Choose Your Display Name</h3>
                <p className="text-gray-500 text-sm mb-4">
                  This name will be displayed next to your messages in the chat
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-emerald-500" />
                    Display Name
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="username"
                        placeholder="Enter your display name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="pr-10 focus-visible:ring-emerald-500 focus-visible:ring-offset-0 border-gray-200"
                      />
                    </div>
                    <Button
                      onClick={generateNewRandomUsername}
                      variant="outline"
                      className="border-gray-200 hover:bg-gray-50 text-gray-500"
                      title="Generate random name"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={confirmUsername}
                  className={cn(
                    "w-full transition-all duration-200 font-medium",
                    "bg-emerald-500 hover:bg-emerald-600 text-white",
                  )}
                  disabled={username.trim() === ""}
                >
                  <User className="mr-2 h-4 w-4" />
                  Continue with this name
                </Button>
              </div>
            </div>
          </CardContent>
        ) : !joined ? (
          <CardContent className="p-6 sm:p-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">Join a Chatroom</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Enter a coin address to connect to its dedicated chat space
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="coin-address" className="text-sm font-medium text-gray-700">
                    Coin Address
                  </label>
                  <div className="relative">
                    <Input
                      id="coin-address"
                      placeholder="Enter coin address (e.g., BTC, ETH, SOL)"
                      value={coinAddress}
                      onChange={(e) => setCoinAddress(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="pr-10 focus-visible:ring-emerald-500 focus-visible:ring-offset-0 border-gray-200"
                    />
                    {coinAddress.trim() !== "" && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  onClick={joinRoom}
                  className={cn(
                    "w-full transition-all duration-200 font-medium",
                    "bg-emerald-500 hover:bg-emerald-600 text-white",
                  )}
                  disabled={connecting || coinAddress.trim() === ""}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {connecting ? "Connecting..." : "Join Chatroom"}
                </Button>
              </div>
            </div>
          </CardContent>
        ) : (
          <>
            <CardContent className="p-0">
              <ScrollArea ref={scrollAreaRef} className="h-[400px] px-6 py-4">
                {chat.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                    <MessageCircle className="h-12 w-12 text-gray-300" />
                    <p>No messages yet</p>
                    <p className="text-sm text-gray-400">Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-3 pb-2">
                    {chat.map((msg, i) => (
                      <div key={i} className="p-3.5 bg-white rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="font-medium text-emerald-600">{msg.username}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <div className="flex items-center text-xs text-gray-400 whitespace-nowrap">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>{formatMessageTime(msg.timestamp)}</span>
                              </div>
                            </div>
                            <p className="text-gray-800">{msg.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <Separator className="bg-gray-100" />
            </CardContent>
            <CardFooter className="p-4">
              <div className="flex w-full gap-2">
                <div className="relative flex-1">
                  <div className="flex items-center">
                    <button
                      ref={emojiButtonRef}
                      onClick={toggleEmojiPicker}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-500 transition-colors"
                      aria-label="Add emoji"
                    >
                      <Smile className="h-5 w-5" />
                    </button>
                    <Input
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="pl-10 pr-10 focus-visible:ring-emerald-500 focus-visible:ring-offset-0 border-gray-200"
                    />
                    {sending && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  {showEmojiPicker && (
                    <div className="absolute bottom-12 left-0 z-10">
                      <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                  )}
                </div>
                <Button
                  onClick={sendMessage}
                  className={cn("transition-all duration-200", "bg-emerald-500 hover:bg-emerald-600 text-white")}
                  disabled={sending || message.trim() === ""}
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
