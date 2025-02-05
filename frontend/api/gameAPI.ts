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
        contextId: string,
        contextIdentity: string
    }> {
        let response = await httpService.post<any, any>("/games/team", {
            nodePublicKey
        });
        toast.info(JSON.stringify(response));
        return response;
    }

    static async inviteToTeam(nodePublicKey: string, contextId: string, contextIdentity: string): Promise<{
        invitationPayload: string
    }> {
        let response = await httpService.post<any, any>("/games/team/invite", {
            nodePublicKey,
            contextId,
            contextIdentity
        });
        return response;
    }

    static async startGame(initialState: [number, number][], battleId: number): Promise<void> {
        await httpService.post<any, any>("/games/start-game", {
            initialState,
            battleId
        });
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
        return proof;
    }

    static async submitBattleProof(battleId: number, solution: number[], isPublic: boolean, playerContributions: {
        player: Principal,
        percent: number
    }[]): Promise<void> {
        let playerContributionsJson = playerContributions.map((x) => ({
            player: x.player.toString(),
            percent: x.percent
        }));

        await httpService.post<any, any>("/games/battle/solution", {
            battleId,
            solution,
            public: isPublic,
            playerContributions: playerContributionsJson
        });
    }
}
