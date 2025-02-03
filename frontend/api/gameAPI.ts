import { toast } from "react-toastify";
import { httpService } from "./httpService";
import { Principal } from "@dfinity/principal";

export class GameAPI {
    static async getServiceFee(): Promise<number> {
        let fee = await httpService.get<any, number>("/games/service-fee");
        console.log(fee);
        return fee / process.env.TOKEN_DECIMALS;
    }

    static async createNewBattle(depositPrice: number, creator: Principal): Promise<number> {
        depositPrice *= process.env.TOKEN_DECIMALS;
        let response = await httpService.post<any, any>("/games/battle", {
            deposit_price: depositPrice,
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

    static async startGame(initial_state: [number, number][], battle_id: number): Promise<string> {
        let txHash = await httpService.post<any, any>("/games/start-game", {
            initial_state,
            battle_id
        });
        console.log(txHash);
        return txHash;
    }

    static async generateProof(initial_state: [number, number][], solution: number[]): Promise<{
        proof_bytes: string,
        public_input_bytes: string
    }> {
        let proof = await httpService.post<any, {
            proof_bytes: string,
            public_input_bytes: string
        }>("/games/generate-proof", {
            initial_state,
            solution
        });
        console.log(proof);
        return proof;
    }
}
