"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import io from "socket.io-client"
import { generateRandomUsername } from "@/lib/username-utils"

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000")

interface Message {
  user: string
  text: string
  timestamp: number
}

export default function ChatApp() {
  const [coinAddress, setCoinAddress] = useState("")
  const [username, setUsername] = useState("")
  const [joined, setJoined] = useState(false)
  const [chat, setChat] = useState<Message[]>([])
  const [message, setMessage] = useState("")
  const [connecting, setConnecting] = useState(false)
  const chatBoxRef = useRef<HTMLDivElement>(null)

  // Generate random username on component mount
  useEffect(() => {
    setUsername(generateRandomUsername())
  }, [])

  // Listen for incoming messages
  useEffect(() => {
    socket.on("message", (msg: Message) => {
      setChat((prev) => [...prev, msg])
    })

    return () => {
      socket.off("message")
    }
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
    }
  }, [chat])

  const joinRoom = () => {
    if (coinAddress.trim() && username.trim()) {
      setConnecting(true)
      socket.emit("join", { room: coinAddress, username })
      setJoined(true)
      setChat([])
      setTimeout(() => setConnecting(false), 500) // Add slight delay for better UX
    }
  }

  const sendMessage = () => {
    if (message.trim()) {
      const messageData = {
        room: coinAddress,
        user: username,
        text: message,
        timestamp: Date.now(),
      }

      socket.emit("message", messageData)

      // Add message to chat immediately for better UX
      setChat((prev) => [
        ...prev,
        {
          user: username,
          text: message,
          timestamp: Date.now(),
        },
      ])

      setMessage("")
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
    <div
      style={{
        backgroundColor: "#0d0d0d",
        color: "#f44336",
        minHeight: "100vh",
        padding: "40px",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <h1 style={{ color: "#f44336", fontSize: "32px", marginBottom: "20px" }}>Loqui</h1>
      {!joined ? (
        <div style={{ maxWidth: "400px" }}>
          <h2 style={{ marginBottom: "15px" }}>Join a Chatroom</h2>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyPress}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Enter coin address"
            value={coinAddress}
            onChange={(e) => setCoinAddress(e.target.value)}
            onKeyDown={handleKeyPress}
            style={inputStyle}
          />
          <button
            onClick={joinRoom}
            style={buttonStyle}
            disabled={connecting || !username.trim() || !coinAddress.trim()}
          >
            {connecting ? "Connecting..." : "Join"}
          </button>
        </div>
      ) : (
        <>
          <h2 style={{ marginBottom: "15px" }}>Chat for: {coinAddress}</h2>
          <div ref={chatBoxRef} style={chatBoxStyle}>
            {chat.length === 0 ? (
              <div style={{ textAlign: "center", color: "#666", padding: "20px" }}>
                No messages yet. Start the conversation!
              </div>
            ) : (
              chat.map((msg, i) => (
                <div key={i} style={messageStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <strong style={{ color: "#ff6b6b" }}>{msg.user || "Anon"}</strong>
                    {msg.timestamp && (
                      <span style={{ fontSize: "12px", color: "#666" }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                  <div>{msg.text}</div>
                </div>
              ))
            )}
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              style={{ ...inputStyle, flexGrow: 1 }}
            />
            <button onClick={sendMessage} style={buttonStyle} disabled={!message.trim()}>
              Send
            </button>
          </div>
        </>
      )}
    </div>
  )
}

const inputStyle = {
  padding: "10px",
  margin: "10px 10px 10px 0",
  borderRadius: "4px",
  border: "1px solid #f44336",
  backgroundColor: "#1a1a1a",
  color: "white",
  width: "300px",
}

const buttonStyle = {
  padding: "10px 20px",
  backgroundColor: "#f44336",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  transition: "background-color 0.2s",
  ":hover": {
    backgroundColor: "#d32f2f",
  },
  ":disabled": {
    backgroundColor: "#7d2a2a",
    cursor: "not-allowed",
  },
}

const chatBoxStyle = {
  border: "1px solid #f44336",
  padding: "15px",
  height: "400px",
  overflowY: "scroll" as const,
  backgroundColor: "#1a1a1a",
  marginBottom: "20px",
  borderRadius: "4px",
}

const messageStyle = {
  marginBottom: "16px",
  padding: "10px",
  lineHeight: "1.5",
  wordBreak: "break-word" as const,
  backgroundColor: "#262626",
  borderRadius: "4px",
}
