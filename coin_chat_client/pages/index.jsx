import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

// ---------------- env + socket ----------------
const socket = io(process.env.REACT_APP_SOCKET_URL);

// ---------------- helpers ----------------
const randUsername = () =>
  [...crypto.getRandomValues(new Uint8Array(16))]
    .map(v => 'abcdefghijklmnopqrstuvwxyz0123456789'[v % 36])
    .join('');

export default function ChatApp() {
  // -------- state --------
  const [username] = useState(
    () => localStorage.getItem('loquiUser') || (() => {
      const u = randUsername();
      localStorage.setItem('loquiUser', u);
      return u;
    })());
  const [address, setAddress] = useState('');
  const [joined,  setJoined ] = useState(false);
  const [chat,    setChat   ] = useState([]);
  const [message, setMessage] = useState('');

  const bottomRef = useRef(null);

  // -------- socket listeners --------
  useEffect(() => {
    socket.on('chat-history', history => setChat(history));
    socket.on('message', msg   => setChat(prev => [...prev, msg]));
    socket.on('error',   err   => alert(err));

    return () => socket.off();   // clean
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); },
            [chat]);

  // -------- actions --------
  const joinRoom = () => {
    if (!address.trim()) return;
    socket.emit('join', { room: address.trim() });
    setJoined(true);
    setChat([]);          // clear GUI – history will fill
  };

  const send = () => {
    if (!message.trim()) return;
    socket.emit('message', { room: address.trim(), username, text: message });
    setMessage('');
  };

  // allow Enter to submit
  const handleKey = e => e.key === 'Enter' && !e.shiftKey && send();

  // -------- render --------
  return (
    <div className="min-h-screen bg-black text-red-500 flex flex-col items-center p-4">
      {/* logo / header */}
      <img src="/loqui-logo.png" alt="Loqui" className="w-36 mb-6 select-none" />

      {!joined ? (
        <div className="w-full max-w-md">
          <label className="block mb-2 text-xl">Enter Solana Contract Address</label>
          <input
            className="w-full p-3 rounded bg-zinc-900 text-red-300 focus:outline-red-600"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Eg. 7GHf2tSExk..."/>
          <button
            onClick={joinRoom}
            className="mt-4 w-full py-2 bg-red-600 rounded hover:bg-red-700 font-bold">
            Join Chat
          </button>
        </div>
      ) : (
        <>
          <h2 className="text-xl mb-2">
            Chat for&nbsp;
            <span className="font-mono text-red-400">{address.slice(0,4)}…{address.slice(-4)}</span>
          </h2>
          <p className="mb-4 text-sm">You are&nbsp;
            <span className="font-mono">{username}</span>
          </p>

          {/* chat box */}
          <div
            className="w-full max-w-4xl flex-1 overflow-y-auto bg-zinc-900 rounded p-4 space-y-3">
            {chat.map(m => (
              <div key={m._id ?? Math.random()}>
                <span className="font-mono text-red-400">{m.username}</span>
                <span className="mx-2 text-zinc-500">•</span>
                <span>{m.text}</span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* input */}
          <div className="w-full max-w-4xl mt-4 flex">
            <textarea
              className="flex-1 bg-zinc-900 rounded-l p-3 resize-none focus:outline-red-600"
              rows={2}
              value={message}
              placeholder="Type message…"
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKey}/>
            <button
              onClick={send}
              className="px-6 bg-red-600 rounded-r hover:bg-red-700 font-bold">
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}
