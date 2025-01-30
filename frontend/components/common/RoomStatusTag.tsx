import { RoomStatus, roomStatusColor } from "@/types/room"

export default function GameStatusTag({
    status
}: {
    status: RoomStatus
}) {
    return (
        <div
            className="flex gap-2 w-fit px-3 items-center rounded-lg border"
            style={{
                borderColor: roomStatusColor[status],
                // backgroundColor: lightenDarkenColor(roomStatusColor[status], 100)
            }}
        >
            <div className="rounded-full h-2 w-2" style={{ backgroundColor: roomStatusColor[status] }} />
            <span className="text-muted uppercase text-xs font-bold">{status}</span>
        </div>
    )
}
