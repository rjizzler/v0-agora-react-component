const express = require("express")
const http = require("http")
const cors = require("cors")
const { Server } = require("socket.io")

const app = express()
app.use(
  cors({
    origin: "*", // In production, specify your frontend domain
    methods: ["GET", "POST"],
    credentials: true,
  }),
)

const server = http.createServer(app)

// Create Socket.io server with proper CORS settings
const io = new Server(server, {
  cors: {
    origin: "*", // In production, specify your frontend domain
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
})

// Store active rooms and their messages
const rooms = new Map()

// Debug middleware to log all events
io.use((socket, next) => {
  const originalEmit = socket.emit
  socket.emit = () => {
    console.log(`SOCKET EMIT: ${arguments[0]}`)
    return originalEmit.apply(socket, arguments)
  }
  next()
})

io.on("connection", (socket) => {
  console.log("User connected:", socket.id)
  let currentRoom = null

  // Send connection confirmation
  socket.emit("connectionStatus", { connected: true, socketId: socket.id })

  socket.on("join", (data) => {
    try {
      // Validate data
      if (!data || !data.room) {
        console.error("Invalid join data:", data)
        return
      }

      // Normalize room name to prevent duplicate rooms with different casing
      const normalizedRoom = data.room.toLowerCase().trim()
      const username = data.username || "Anonymous"

      // Leave previous room if any
      if (currentRoom) {
        socket.leave(currentRoom)

        // Update user count in previous room
        if (rooms.has(currentRoom)) {
          const prevRoomData = rooms.get(currentRoom)
          prevRoomData.users.delete(socket.id)
          io.to(currentRoom).emit("roomUserCount", prevRoomData.users.size)
        }
      }

      currentRoom = normalizedRoom

      // Join the socket to the room
      socket.join(normalizedRoom)
      console.log(`User ${username} (${socket.id}) joined room ${normalizedRoom}`)

      // Create room if it doesn't exist
      if (!rooms.has(normalizedRoom)) {
        console.log(`Creating new room: ${normalizedRoom}`)
        rooms.set(normalizedRoom, {
          messages: [],
          users: new Set(),
        })
      }

      // Add user to room
      const roomData = rooms.get(normalizedRoom)
      roomData.users.add(socket.id)

      console.log(`Room ${normalizedRoom} now has ${roomData.users.size} users`)

      // Log all rooms and their user counts
      console.log("Current rooms:")
      for (const [room, data] of rooms.entries()) {
        console.log(`- ${room}: ${data.users.size} users, ${data.messages.length} messages`)
      }

      // Send room history to the user
      socket.emit("roomHistory", roomData.messages)

      // Broadcast updated user count to everyone in the room
      io.to(normalizedRoom).emit("roomUserCount", roomData.users.size)
    } catch (error) {
      console.error("Error in join handler:", error)
    }
  })

  socket.on("message", (data) => {
    try {
      // Validate data
      if (!data || !data.room || !data.text) {
        console.error("Invalid message data:", data)
        return
      }

      // Normalize room name
      const normalizedRoom = data.room.toLowerCase().trim()

      if (!rooms.has(normalizedRoom)) {
        console.error(`Room ${normalizedRoom} does not exist`)
        return
      }

      const msg = {
        username: data.username || "Anonymous",
        text: data.text,
        timestamp: Date.now(),
      }

      console.log(`Message in room ${normalizedRoom} from ${msg.username}: ${msg.text.substring(0, 20)}...`)

      // Store message in room history
      const roomData = rooms.get(normalizedRoom)
      roomData.messages.push(msg)

      // Limit history to last 100 messages
      if (roomData.messages.length > 100) {
        roomData.messages.shift()
      }

      // Broadcast message to all users in the room
      io.to(normalizedRoom).emit("message", msg)
    } catch (error) {
      console.error("Error in message handler:", error)
    }
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

// Add a health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send({
    status: "ok",
    rooms: Array.from(rooms.keys()),
    totalRooms: rooms.size,
  })
})

const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
  console.log(`Loqui server running on port ${PORT}`)
})
