"use client";

import { useState } from "react";

export default function CreateRoom() {
  const [adminName, setAdminName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  const handleCreate = () => {
    if (!adminName || !roomId)
      return alert("Fill all fields");

    const link = `${window.location.origin}/?room=${roomId}`;
    setInviteLink(link);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    alert("Link copied!");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500">
      <div className="bg-white p-8 rounded-xl w-96 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Admin Create Room
        </h2>

        <input
          placeholder="Admin Name"
          className="w-full p-3 border rounded mb-4"
          value={adminName}
          onChange={(e) => setAdminName(e.target.value)}
        />

        <input
          placeholder="Create Room ID"
          className="w-full p-3 border rounded mb-4"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />

        <button
          onClick={handleCreate}
          className="w-full bg-blue-600 text-white py-3 rounded"
        >
          Generate Invite Link
        </button>

        {inviteLink && (
          <div className="mt-4">
            <input
              value={inviteLink}
              readOnly
              className="w-full p-2 border rounded mb-2"
            />
            <button
              onClick={copyLink}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              Copy Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}