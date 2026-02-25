import JoinClient from "./JoinClient";

export default function Page({
  searchParams,
}: {
  searchParams: { room?: string };
}) {
  return <JoinClient initialRoomId={searchParams.room || ""} />;
}
