import { BattleStatus, battleStatusColor } from "@/types/battle"

export default function GameStatusTag({
    status
}: {
    status: BattleStatus
}) {
    return (
        <div
            className="flex gap-2 w-fit px-3 items-center rounded-lg border"
            style={{
                borderColor: battleStatusColor[status],
                // backgroundColor: lightenDarkenColor(battleStatusColor[status], 100)
            }}
        >
            <div className="rounded-full h-2 w-2" style={{ backgroundColor: battleStatusColor[status] }} />
            <span className="text-muted uppercase text-xs font-bold">{status}</span>
        </div>
    )
}
