const express = require("express")
const http = require("http")
const cors = require("cors")
const { Server } = require("socket.io")

const app = express()
app.use(cors())

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*", // Update with your frontend URL in production
    methods: ["GET", "POST"],
  },
})

// Store active rooms and their messages
const rooms = new Map()

io.on("connection", (socket) => {
  console.log("User connected:", socket.id)
  let currentRoom = null

  socket.on("join", ({ room, username }) => {
    // Normalize room name to prevent duplicate rooms with different casing
    const normalizedRoom = room.toLowerCase().trim()
    currentRoom = normalizedRoom

    // Join the socket to the room
    socket.join(normalizedRoom)

    // Create room if it doesn't exist
    if (!rooms.has(normalizedRoom)) {
      rooms.set(normalizedRoom, {
        messages: [],
        users: new Set(),
      })
    }

    // Add user to room
    const roomData = rooms.get(normalizedRoom)
    roomData.users.add(socket.id)

    console.log(`User ${username} (${socket.id}) joined room ${normalizedRoom}`)
    console.log(`Room ${normalizedRoom} now has ${roomData.users.size} users`)

    // Send room history to the user
    socket.emit("roomHistory", roomData.messages)

    // Broadcast updated user count to everyone in the room
    io.to(normalizedRoom).emit("roomUserCount", roomData.users.size)
  })

  socket.on("message", ({ room, username, text }) => {
    // Normalize room name
    const normalizedRoom = room.toLowerCase().trim()

    if (!rooms.has(normalizedRoom)) {
      console.error(`Room ${normalizedRoom} does not exist`)
      return
    }

    const msg = {
      username,
      text,
      timestamp: Date.now(),
    }

    // Store message in room history
    const roomData = rooms.get(normalizedRoom)
    roomData.messages.push(msg)

    // Limit history to last 100 messages
    if (roomData.messages.length > 100) {
      roomData.messages.shift()
    }

    // Broadcast message to all users in the room
    io.to(normalizedRoom).emit("message", msg)
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)

    // Remove user from their current room
    if (currentRoom && rooms.has(currentRoom)) {
      const roomData = rooms.get(currentRoom)
      roomData.users.delete(socket.id)

      console.log(`Room ${currentRoom} now has ${roomData.users.size} users`)

      // Broadcast updated user count
      io.to(currentRoom).emit("roomUserCount", roomData.users.size)

      // Clean up empty rooms after some time
      if (roomData.users.size === 0) {
        setTimeout(() => {
          if (rooms.has(currentRoom) && rooms.get(currentRoom).users.size === 0) {
            console.log(`Removing empty room: ${currentRoom}`)
            rooms.delete(currentRoom)
          }
        }, 3600000) // Clean up after 1 hour of inactivity
      }
    }
  })
})

const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
  console.log(`Loqui server running on port ${PORT}`)
})
