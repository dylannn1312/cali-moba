import { toast } from "react-toastify";
import { httpService } from "./httpService";

export class GameAPI {
    static async getServiceFee(): Promise<number> {
        let fee = await httpService.get<any, number>("/games/service-fee");
        console.log(fee);
        return fee / 1_000_000;
    }

    static async createNewBattle(deposit_price: number, creator: string): Promise<{
        tx_hash: string,
        battle_id: number
    }> {
        deposit_price *= 1_000_000;
        let response = await httpService.post<any, any>("/games/new-battle", {
            deposit_price,
            creator
        });
        console.log(response);
        return response;
    }

    static async createNewTeam(nodePublicKey: string): Promise<{
        invitationPayload: string,
        contextId: string
    }> {
        let response = await httpService.post<any, any>("/games/team/new", {
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
