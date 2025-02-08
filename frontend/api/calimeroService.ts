import { getStoragePanic, StorageKey } from '@/utils/storage';
import { JsonRpcClient } from '@calimero-network/calimero-client';
import { Principal } from '@dfinity/principal';
import { isUndefined } from 'lodash';
import { toast } from 'react-toastify';

function calimeroClient(nodeUrl: string) {
    return new JsonRpcClient(
        nodeUrl,
        '/jsonrpc',
    );
}

export type CellInfo = {
    position: number;
    value: number;
    editor_address: string;
    editor_name: string;
};

export class SudokuCaller {
    private client: JsonRpcClient;

    constructor(nodeUrl: string) {
        this.client = calimeroClient(nodeUrl);
    }

    async setCell(info: CellInfo) {
        let res = await this.client.execute<CellInfo, void>({
            contextId: getStoragePanic(StorageKey.CONTEXT_ID),
            method: "set_cell",
            argsJson: info,
            executorPublicKey: getJWTObject().executor_public_key
        }, {
            headers: getHeaders()
        });
        if (res.error) {
            throw res.error;
        }
    }

    async removeCell(info: Omit<CellInfo, 'value'>) {
        let res = await this.client.execute({
            contextId: getStoragePanic(StorageKey.CONTEXT_ID),
            method: "remove_cell",
            argsJson: info,
            executorPublicKey: getJWTObject().executor_public_key
        }, {
            headers: getHeaders()
        });
        if (res.error) {
            throw res.error;
        }
    }


    async getRemovedCells(): Promise<Omit<CellInfo, 'value'>[]> {
        let res = await this.client.execute<{}, [number, string, string][]>({
            contextId: getStoragePanic(StorageKey.CONTEXT_ID),
            method: "get_removed_cells",
            argsJson: {},
            executorPublicKey: getJWTObject().executor_public_key
        }, {
            headers: getHeaders()
        });
        if (res.error) {
            throw res.error;
        }
        if (!res.result?.output) {
            return [];
        }
        return res.result.output.map(([position, editor_address, editor_name]) => ({
            position,
            editor_address,
            editor_name
        }));
    }

    async getCurrentSolution(): Promise<CellInfo[]> {
        let res = await this.client.execute<{}, [number, number, string, string][]>({
            contextId: getStoragePanic(StorageKey.CONTEXT_ID),
            method: "get_current_solution",
            argsJson: {},
            executorPublicKey: getJWTObject().executor_public_key
        }, {
            headers: getHeaders()
        });
        if (res.error) {
            throw res.error;
        }
        if (!res.result?.output) {
            return [];
        }
        return res.result.output.map(([position, value, editor_address, editor_name]) => ({
            position,
            value,
            editor_address,
            editor_name
        }));
    }

    async voteSolution(isPublic: boolean, caller: Principal): Promise<void> {
        let res = await this.client.execute<{}, void>({
            contextId: getStoragePanic(StorageKey.CONTEXT_ID),
            method: "vote_solution",
            argsJson: {
                public: isPublic,
                caller: caller.toString()
            },
            executorPublicKey: getJWTObject().executor_public_key
        }, {
            headers: getHeaders()
        });
        if (res.error) {
            throw res.error;
        }
    }

    async getVoteSolution(): Promise<[string[], string[]]> {
        let res = await this.client.execute<{}, [string[], string[]]>({
            contextId: getStoragePanic(StorageKey.CONTEXT_ID),
            method: "get_vote_solution",
            argsJson: {},
            executorPublicKey: getJWTObject().executor_public_key
        }, {
            headers: getHeaders()
        });
        if (res.error) {
            throw res.error;
        }
        return res.result.output ?? [[], []];
    }
}

function getJWTObject(): JsonWebToken {
    const token = getStoragePanic(StorageKey.ACCESS_TOKEN);
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('Invalid JWT token');
    }
    const payload = JSON.parse(atob(parts[1]));
    return payload;
};

function getHeaders() {
    return {
        authorization: `Bearer ${getStoragePanic(StorageKey.ACCESS_TOKEN)}`
    };
}

export interface JsonWebToken {
    context_id: string;
    token_type: string;
    exp: number;
    sub: string;
    executor_public_key: string;
}
