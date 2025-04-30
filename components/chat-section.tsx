"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, LogOut, User, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface Message {
  id: string
  sender: string
  text: string
  timestamp: Date
}

interface ChatSectionProps {
  address: string
  isConnected: boolean
  onDisconnect: () => void
  onConnect: (address: string) => void
}

export default function ChatSection({ address, isConnected, onDisconnect, onConnect }: ChatSectionProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [inputAddress, setInputAddress] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Generate random username for demo
  const username = useRef(`User${Math.floor(Math.random() * 10000)}`)

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Add some demo messages when connected
  useEffect(() => {
    if (isConnected && messages.length === 0) {
      const demoMessages = [
        {
          id: "1",
          sender: "AgoraBot",
          text: `Welcome to the ${address.substring(0, 6)}...${address.substring(address.length - 4)} chatroom!`,
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
        },
        {
          id: "2",
          sender: "Satoshi",
          text: "Hey everyone! What's the latest news about this project?",
          timestamp: new Date(Date.now() - 1000 * 60 * 3),
        },
        {
          id: "3",
          sender: "CryptoFan",
          text: "I heard they're planning a major update next month.",
          timestamp: new Date(Date.now() - 1000 * 60 * 2),
        },
      ]
      setMessages(demoMessages)
    }
  }, [isConnected, address, messages.length])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() === "") return

    const message: Message = {
      id: Date.now().toString(),
      sender: username.current,
      text: newMessage,
      timestamp: new Date(),
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault()
    onConnect(inputAddress)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <section id="chat" className="py-20 px-4 bg-[#121212] min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 mb-8 text-center">
          Join the Conversation
        </h3>

        {!isConnected ? (
          <Card className="bg-[#1E1E1E] border-red-600/30 text-white">
            <CardHeader>
              <CardTitle>Connect to a Chatroom</CardTitle>
              <CardDescription className="text-gray-400">
                Enter a coin or contract address to join its dedicated chatroom
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConnect} className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="text"
                  placeholder="Enter address (e.g., 0x1234...)"
                  value={inputAddress}
                  onChange={(e) => setInputAddress(e.target.value)}
                  className="bg-[#252525] border-red-600/50 focus:border-red-500 text-white"
                  required
                />
                <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                  Connect
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-[#1E1E1E] border-red-600/30 text-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-red-600/20 text-red-400 border-red-600">
                    <Users size={14} className="mr-1" /> 24 Online
                  </Badge>
                </CardTitle>
                <CardDescription className="text-gray-400 mt-2">
                  Connected to: {address.substring(0, 8)}...{address.substring(address.length - 6)}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDisconnect}
                className="text-gray-400 hover:text-red-400 hover:bg-red-600/10"
              >
                <LogOut size={16} className="mr-1" /> Disconnect
              </Button>
            </CardHeader>

            <Separator className="bg-gray-800" />

            <CardContent className="p-0">
              <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === username.current ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === username.current ? "bg-red-600/20 text-white" : "bg-[#252525] text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <User size={14} />
                        <span className="font-semibold text-sm">{message.sender}</span>
                        <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
                      </div>
                      <p>{message.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-2">
              <form onSubmit={handleSendMessage} className="w-full flex gap-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="bg-[#252525] border-red-600/50 focus:border-red-500 text-white"
                />
                <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
                  <Send size={16} />
                </Button>
              </form>
            </CardFooter>
          </Card>
        )}
      </div>
    </section>
  )
}
