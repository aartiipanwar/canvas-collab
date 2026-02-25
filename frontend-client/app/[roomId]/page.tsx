import CanvasBoard from "@/components/CanvasBoard";
import ChatSidebar from "@/components/ChatSidebar";
import RoomNavbar from "@/components/RoomNavbar";

export default async function RoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ username?: string }>;
}) {
  const { roomId } = await params;
  const { username } = await searchParams;

  return (
    <div className="h-screen flex bg-gray-100">
      <div className="flex-1 p-4">
        <CanvasBoard
          roomId={roomId}
          username={username || "Guest"}
        />
      </div>
      <div className="w-80 border-l bg-white">
      <ChatSidebar
        roomId={roomId}
        username={username || "Guest"}
      />
      <RoomNavbar roomId={roomId} username={username || "Guest"} />
      </div>
    </div>
  );
}