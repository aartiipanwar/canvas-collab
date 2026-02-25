"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinClient({
  initialRoomId,
}: {
  initialRoomId: string;
}) {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState(initialRoomId);

  const handleJoin = () => {
    if (!username || !roomId)
      return alert("Fill all fields");

    router.push(`/${roomId}?username=${username}`);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-xl w-96 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Join Room</h2>

        <input
          placeholder="Enter your name"
          className="w-full p-3 border rounded mb-4"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          placeholder="Enter Room ID"
          className="w-full p-3 border rounded mb-4"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />

        <button
          onClick={handleJoin}
          className="w-full bg-purple-600 text-white py-3 rounded"
        >
          Join Room
        </button>
      </div>
    </div>
  );
}
