import { toast } from "react-toastify";
import { httpService } from "./httpService";
import { Principal } from "@dfinity/principal";

export class GameAPI {
    static async getGameInfo(): Promise<{
        gameContract: string,
        serviceFee: number,
        applicationId: string,
    }> {
        let res = await httpService.get<any, {
            gameContract: string,
            serviceFee: number,
            applicationId: string,
        }>("/games/info");
        res.serviceFee /= process.env.TOKEN_DECIMALS;
        return res;
    }

    static async createNewBattle(depositPrice: number, creator: Principal): Promise<number> {
        depositPrice *= process.env.TOKEN_DECIMALS;
        let response = await httpService.post<any, any>("/games/battle", {
            depositPrice,
            creator: creator.toString()
        });
        console.log(response);
        return response;
    }

    static async joinBattle(battleId: number, player: Principal): Promise<void> {
        await httpService.post<any, any>("/games/battle/join", {
            battleId,
            player: player.toString()
        });
    }

    static async getBattleInfo(battleId: number): Promise<{
        initial_state?: [number, number][],
        creator: string,
        deposit_price: number,
        service_fee: number,
        players: string[],
    }> {
        let res = await httpService.get<any, any>(`/games/battle/info/${battleId}`);
        res.deposit_price /= process.env.TOKEN_DECIMALS;
        res.service_fee /= process.env.TOKEN_DECIMALS;
        return res;
    }

    static async createNewTeam(nodePublicKey: string): Promise<{
        invitationPayload: string,
        contextId: string
    }> {
        let response = await httpService.post<any, any>("/games/team", {
            nodePublicKey
        });
        toast.info(JSON.stringify(response));
        return response;
    }

    static async startGame(initialState: [number, number][], battleId: number): Promise<string> {
        let txHash = await httpService.post<any, any>("/games/start-game", {
            initialState,
            battleId
        });
        console.log(txHash);
        return txHash;
    }

    static async generateProof(initialState: [number, number][], solution: number[]): Promise<{
        proofBytes: string,
        publicInputBytes: string
    }> {
        let proof = await httpService.post<any, {
            proofBytes: string,
            publicInputBytes: string
        }>("/games/generate-proof", {
            initialState,
            solution
        });
        console.log(proof);
        return proof;
    }
}
