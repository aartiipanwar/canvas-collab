"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

interface Props {
  roomId: string;
  username: string;
}

export default function ChatSidebar({ roomId, username }: Props) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    socket.on("receive-message", (msg: string) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receive-message");
    };
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;

    const fullMessage = `${username}: ${message}`;

    socket.emit("send-message", {
      roomId,
      message: fullMessage,
    });

    setMessages((prev) => [...prev, fullMessage]);
    setMessage("");
  };

  return (
    <div className="w-80 bg-white border-l shadow-lg flex flex-col p-4">
      <h2 className="font-semibold mb-4 text-gray-700">💬 Group Chat</h2>

      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className="bg-gray-100 px-3 py-2 rounded-lg text-sm">
            {msg}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
          placeholder="Type message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}