"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";

interface Props {
  roomId: string;
  username: string;
}

export default function RoomNavbar({ roomId, username }: Props) {
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // ✅ JOIN ROOM (Only here)
  useEffect(() => {
    socket.emit("join-room", roomId);
  }, [roomId]);

  // 🎤 Start Voice
  const startVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      peerRef.current = peer;

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            roomId,
            candidate: event.candidate,
          });
        }
      };

      peer.ontrack = (event) => {
        const audio = new Audio();
        audio.srcObject = event.streams[0];
        audio.play();
      };

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit("offer", { roomId, offer });

      setIsCalling(true);
    } catch (err) {
      alert("Mic permission denied or error occurred.");
      console.error(err);
    }
  };

  const toggleMute = () => {
    if (!localStreamRef.current) return;

    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsMuted((prev) => !prev);
  };

  const endCall = () => {
    peerRef.current?.close();
    peerRef.current = null;

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    setIsCalling(false);
    setIsMuted(false);
  };

  // 🎧 Socket listeners
  useEffect(() => {
    socket.on("offer", async (offer) => {
      const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      peerRef.current = peer;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            roomId,
            candidate: event.candidate,
          });
        }
      };

      peer.ontrack = (event) => {
        const audio = new Audio();
        audio.srcObject = event.streams[0];
        audio.play();
      };

      await peer.setRemoteDescription(offer);

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("answer", { roomId, answer });

      setIsCalling(true);
    });

    socket.on("answer", async (answer) => {
      await peerRef.current?.setRemoteDescription(answer);
    });

    socket.on("ice-candidate", async (candidate) => {
      try {
        await peerRef.current?.addIceCandidate(candidate);
      } catch (err) {
        console.error("ICE error", err);
      }
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [roomId]);

  return (
    <div className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
      <div className="text-lg font-semibold">
        Room: <span className="text-blue-600">{roomId}</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-gray-600">👤 {username}</span>

        <button
          onClick={() => navigator.clipboard.writeText(roomId)}
          className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm"
        >
          Copy ID
        </button>

        {!isCalling ? (
          <button
            onClick={startVoice}
            className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm"
          >
            🎤 Start
          </button>
        ) : (
          <>
            <button
              onClick={toggleMute}
              className="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm"
            >
              {isMuted ? "🔊 Unmute" : "🔇 Mute"}
            </button>

            <button
              onClick={endCall}
              className="bg-red-600 text-white px-3 py-1 rounded-md text-sm"
            >
              ❌ End
            </button>
          </>
        )}
      </div>
    </div>
  );
}