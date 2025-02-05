import { GameInfo } from "./game";

export enum BattleStatus {
    Playing = "Playing",
    Pending = "Pending",
    Finished = "Finished"
}

export interface BattleInfo {
    idByGame: number;
    creator: string;
    status: BattleStatus;
    playerCount: number;
    gameInfo: Pick<GameInfo, "splashImg" | "name" | "slug">;
    depositPrice: number;
}

export const battleStatusColor: Record<BattleStatus, string> = {
    [BattleStatus.Playing]: "#3DFFB9",
    [BattleStatus.Pending]: "#11DAF4",
    [BattleStatus.Finished]: "#BEC8C8"
}

export interface SetSudokuValueEvent {
    position: number,
    value: number,
    editor: string
}
