"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import io from "socket.io-client"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MessageCircle, Send, Clock, Smile, RefreshCw, User, ArrowLeft } from "lucide-react"
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

export default function ChatRoom() {
  const params = useParams()
  const contractAddress = params.contract as string

  const [username, setUsername] = useState("")
  const [usernameSet, setUsernameSet] = useState(false)
  const [chat, setChat] = useState<Message[]>([])
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const emojiButtonRef = useRef<HTMLButtonElement>(null)

  // Generate a random username on initial load
  useEffect(() => {
    setUsername(generateRandomUsername())
  }, [])

  // Join the room when username is set
  useEffect(() => {
    if (usernameSet && contractAddress) {
      socket.emit("join", { room: contractAddress, username })
    }
  }, [usernameSet, contractAddress, username])

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

  const sendMessage = () => {
    if (message.trim() !== "") {
      setSending(true)
      const messageData = {
        room: contractAddress,
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

  // Format contract address for display
  const formatContractAddress = (address: string) => {
    if (address.length <= 12) return address
    return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4 sm:p-6">
      <Card className="w-full max-w-lg shadow-lg border-gray-700 bg-gray-800 text-white">
        <CardHeader className="bg-gray-800 border-b border-gray-700 rounded-t-xl p-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition-colors">
              <ArrowLeft className="h-5 w-5 text-white" />
            </Link>
            <div className="flex items-center space-x-2">
              <Image src="/assets/LoquiLogo.png" alt="Loqui Logo" width={24} height={24} />
              <h2 className="text-xl font-semibold tracking-tight text-red-500">Loqui</h2>
            </div>
            <div className="flex-1 ml-2">
              <p className="text-gray-300 text-sm">
                {usernameSet
                  ? `Connected to ${formatContractAddress(contractAddress)} as ${username}`
                  : "Choose your display name to join the chat"}
              </p>
            </div>
          </div>
        </CardHeader>

        {!usernameSet ? (
          <CardContent className="p-6 sm:p-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-1">Choose Your Display Name</h3>
                <p className="text-gray-400 text-sm mb-4">
                  This name will be displayed next to your messages in the chat
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <User className="h-4 w-4 text-red-400" />
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
                        className="bg-gray-700 border-gray-600 text-white focus-visible:ring-red-500 focus-visible:ring-offset-gray-900"
                      />
                    </div>
                    <Button
                      onClick={generateNewRandomUsername}
                      variant="outline"
                      className="border-gray-600 hover:bg-gray-700 text-gray-300"
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
                    "bg-red-600 hover:bg-red-700 text-white",
                  )}
                  disabled={username.trim() === ""}
                >
                  <User className="mr-2 h-4 w-4" />
                  Continue with this name
                </Button>
              </div>
            </div>
          </CardContent>
        ) : (
          <>
            <CardContent className="p-0">
              <ScrollArea ref={scrollAreaRef} className="h-[400px] px-6 py-4 scrollbar-thin">
                {chat.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                    <MessageCircle className="h-12 w-12 text-gray-500" />
                    <p>No messages yet</p>
                    <p className="text-sm text-gray-500">Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-3 pb-2">
                    {chat.map((msg, i) => (
                      <div key={i} className="p-3.5 bg-gray-700 rounded-lg border border-gray-600 shadow-sm">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="font-medium text-red-400">{msg.username}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <div className="flex items-center text-xs text-gray-400 whitespace-nowrap">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>{formatMessageTime(msg.timestamp)}</span>
                              </div>
                            </div>
                            <p className="text-gray-100">{msg.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <Separator className="bg-gray-700" />
            </CardContent>
            <CardFooter className="p-4 bg-gray-800">
              <div className="flex w-full gap-2">
                <div className="relative flex-1">
                  <div className="flex items-center">
                    <button
                      ref={emojiButtonRef}
                      onClick={toggleEmojiPicker}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors"
                      aria-label="Add emoji"
                    >
                      <Smile className="h-5 w-5" />
                    </button>
                    <Input
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="pl-10 pr-10 bg-gray-700 border-gray-600 text-white focus-visible:ring-red-500 focus-visible:ring-offset-gray-900"
                    />
                    {sending && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
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
                  className={cn("transition-all duration-200", "bg-red-600 hover:bg-red-700 text-white")}
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
