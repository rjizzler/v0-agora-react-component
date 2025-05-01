// ---------------- core deps ----------------
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';

// ---------------- init ----------------
const app   = express();
const httpServer = http.createServer(app);
const io    = new Server(httpServer, { cors: { origin: '*' }});

// ---------------- persistence ----------------
const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017';
const DB_NAME   = 'loqui';
const client    = new MongoClient(MONGO_URI);
await client.connect();
const db        = client.db(DB_NAME);
const messages  = db.collection('messages');   // { _id, room, username, text, ts }

// ---------------- helpers ----------------
const validCA   = ca =>
  /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(ca.trim());      // Solana base-58

// ---------------- socket logic ----------------
io.on('connection', socket => {
  socket.on('join', async ({ room }) => {
    if (!validCA(room)) return socket.emit('error', 'Invalid contract address');

    socket.join(room);

    // send the last 100 msgs to this late-comer
    const history = await messages
      .find({ room })
      .sort({ ts: -1 })
      .limit(100)
      .toArray();
    socket.emit('chat-history', history.reverse());  // oldest->newest
  });

  socket.on('message', async ({ room, username, text }) => {
    if (!text?.trim()) return;
    const msgDoc = { room, username, text: text.trim(), ts: new Date() };
    await messages.insertOne(msgDoc);     // persist
    io.to(room).emit('message', msgDoc);  // broadcast
  });
});

// ---------------- boot ----------------
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () =>
  console.log(`Loqui socket server live on :${PORT}`));
