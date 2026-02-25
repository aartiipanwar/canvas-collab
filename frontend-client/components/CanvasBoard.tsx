"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";

interface Props {
  roomId: string;
  username: string;
}

export default function CanvasBoard({ roomId }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevPos = useRef<{ x: number; y: number } | null>(null);

  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [color, setColor] = useState("#000000");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
  }, []);

  // ✅ NO join-room here
  useEffect(() => {
    socket.on("draw", (data) => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.size;
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.moveTo(data.prevX, data.prevY);
      ctx.lineTo(data.x, data.y);
      ctx.stroke();
    });

    socket.on("clear", () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      socket.off("draw");
      socket.off("clear");
    };
  }, [roomId]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    prevPos.current = {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    };
    setDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !prevPos.current) return;

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    const size = tool === "eraser" ? 20 : 3;
    const strokeColor = tool === "eraser" ? "#ffffff" : color;

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = size;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(prevPos.current.x, prevPos.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    socket.emit("draw", {
      roomId,
      prevX: prevPos.current.x,
      prevY: prevPos.current.y,
      x,
      y,
      color: strokeColor,
      size,
    });

    prevPos.current = { x, y };
  };

  const stopDrawing = () => {
    setDrawing(false);
    prevPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit("clear", roomId);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `room-${roomId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="flex flex-col w-full h-full p-4">
      <div className="flex items-center gap-4 mb-4 bg-white p-3 rounded-xl shadow-md">
        <button onClick={() => setTool("pen")} className="px-4 py-2 bg-blue-600 text-white rounded">✏️ Pen</button>
        <button onClick={() => setTool("eraser")} className="px-4 py-2 bg-red-500 text-white rounded">🧽 Eraser</button>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <button onClick={clearCanvas} className="px-4 py-2 bg-black text-white rounded">Clear</button>
        <button onClick={downloadImage} className="px-4 py-2 bg-green-600 text-white rounded">Download</button>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  );
}