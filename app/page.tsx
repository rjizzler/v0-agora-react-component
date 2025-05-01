"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import io from "socket.io-client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MessageCircle, Send, LogIn, Users } from "lucide-react"
import { generateRandomUsername } from "@/lib/username-utils"

// Initialize socket connection with explicit configuration
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", {
  transports: ["websocket", "polling"],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: true,
})

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
  const [activeUsers, setActiveUsers] = useState<number>(0)
  const [connectionStatus, setConnectionStatus] = useState<string>("disconnected")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Generate a random username on initial load
  useEffect(() => {
    const randomUsername = generateRandomUsername()
    setUsername(randomUsername)
    console.log("Generated username:", randomUsername)
  }, [])

  // Handle socket connection events
  useEffect(() => {
    function onConnect() {
      console.log("Socket connected:", socket.id)
      setConnectionStatus("connected")
    }

    function onDisconnect() {
      console.log("Socket disconnected")
      setConnectionStatus("disconnected")
    }

    function onConnectError(err: Error) {
      console.error("Connection error:", err)
      setConnectionStatus(`error: ${err.message}`)
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("connect_error", onConnectError)

    // Force reconnect if not connected
    if (!socket.connected) {
      socket.connect()
    }

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("connect_error", onConnectError)
    }
  }, [])

  // Listen for incoming messages and room events
  useEffect(() => {
    // Handle incoming messages
    function onMessage(msg: Message) {
      console.log("Received message:", msg)
      setChat((prev) => [...prev, msg])
    }

    // Handle room user count updates
    function onRoomUserCount(count: number) {
      console.log("Room user count:", count)
      setActiveUsers(count)
    }

    // Handle existing messages when joining a room
    function onRoomHistory(messages: Message[]) {
      console.log("Received room history:", messages)
      setChat(messages)
    }

    socket.on("message", onMessage)
    socket.on("roomUserCount", onRoomUserCount)
    socket.on("roomHistory", onRoomHistory)

    return () => {
      socket.off("message", onMessage)
      socket.off("roomUserCount", onRoomUserCount)
      socket.off("roomHistory", onRoomHistory)
    }
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current
      scrollArea.scrollTop = scrollArea.scrollHeight
    }
  }, [chat])

  const joinRoom = () => {
    if (coinAddress.trim() !== "") {
      setConnecting(true)

      // Normalize the coin address to lowercase and trim whitespace
      const normalizedCA = coinAddress.toLowerCase().trim()

      console.log(`Joining room: ${normalizedCA} as ${username}`)

      // Emit join event with username and room (CA)
      socket.emit("join", {
        room: normalizedCA,
        username: username,
      })

      setJoined(true)

      // Clear chat until we receive room history
      setChat([])

      setTimeout(() => setConnecting(false), 500)
    }
  }

  const sendMessage = () => {
    if (message.trim() !== "") {
      setSending(true)

      // Normalize the coin address
      const normalizedCA = coinAddress.toLowerCase().trim()

      const messageData = {
        room: normalizedCA,
        username: username,
        text: message,
        timestamp: Date.now(),
      }

      console.log("Sending message:", messageData)
      socket.emit("message", messageData)

      // We'll let the server echo back the message instead of adding it locally
      // This ensures consistency across all clients

      setMessage("")
      setTimeout(() => setSending(false), 300)
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
            {joined ? (
              <div className="flex justify-between items-center">
                <span>Connected to {coinAddress}</span>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{activeUsers} online</span>
                </div>
              </div>
            ) : (
              "Join a coin-specific chatroom"
            )}
          </CardDescription>
          {connectionStatus !== "connected" && (
            <div className="mt-2 text-xs bg-red-600 text-white p-1 rounded">
              Socket status: {connectionStatus}. Try refreshing the page.
            </div>
          )}
        </CardHeader>

        {!joined ? (
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Your Username
                </label>
                <Input id="username" value={username} readOnly className="focus-visible:ring-emerald-500 bg-gray-50" />
                <p className="text-xs text-gray-500">This is your randomly generated username for this session</p>
              </div>
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
                disabled={connecting || coinAddress.trim() === "" || connectionStatus !== "connected"}
              >
                <LogIn className="mr-2 h-4 w-4" />
                {connecting ? "Connecting..." : "Join Chatroom"}
              </Button>
            </div>
          </CardContent>
        ) : (
          <>
            <CardContent className="p-0">
              <div className="p-3 bg-emerald-50 border-b border-emerald-100">
                <p className="text-sm text-emerald-800">
                  Your username: <span className="font-mono font-medium">{username}</span>
                </p>
              </div>
              <ScrollArea className="h-[350px] p-4" ref={scrollAreaRef}>
                {chat.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chat.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg ${
                          msg.username === username ? "bg-emerald-100 ml-12" : "bg-gray-100 mr-12"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-mono text-xs text-gray-500">{msg.username}</span>
                          {msg.timestamp && <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>}
                        </div>
                        <p>{msg.text}</p>
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
                  disabled={sending || message.trim() === "" || connectionStatus !== "connected"}
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
