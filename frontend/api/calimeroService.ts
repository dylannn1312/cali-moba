import { getStoragePanic, StorageKey } from '@/utils/storage';
import { JsonRpcClient } from '@calimero-network/calimero-client';
import { isUndefined } from 'lodash';
import { toast } from 'react-toastify';

function calimeroClient(nodeUrl: string) {
    return new JsonRpcClient(
        nodeUrl,
        '/jsonrpc',
    );
}

type CellInfo = {
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

    async removeCell(position: number) {
        let res =  await this.client.execute({
            contextId: getStoragePanic(StorageKey.CONTEXT_ID),
            method: "remove_cell",
            argsJson: {
                position
            },
            executorPublicKey: getJWTObject().executor_public_key
        }, {
            headers: getHeaders()
        });
        if (res.error) {
            throw res.error;
        }
    }

    async getLastChangedCell(): Promise<CellInfo | null> {
        let res = await this.client.execute<{}, [number, number, string, string] | null>({
            contextId: getStoragePanic(StorageKey.CONTEXT_ID),
            method: "get_last_changed_cell",
            argsJson: {},
            executorPublicKey: getJWTObject().executor_public_key
        }, {
            headers: getHeaders()
        });
        console.log({res})
        if (res.error) {
            throw res.error;
        }
        if (!res.result?.output) {
            return null;
        }
        return {
            position: res.result.output[0],
            value: res.result.output[1],
            editor_address: res.result.output[2],
            editor_name: res.result.output[3]
        };
    }


    async getLastRemovedCell(): Promise<CellInfo | null> {
        let res = await this.client.execute<{}, [number, number, string, string]>({
            contextId: getStoragePanic(StorageKey.CONTEXT_ID),
            method: "get_last_removed_cell",
            argsJson: {},
            executorPublicKey: getJWTObject().executor_public_key
        }, {
            headers: getHeaders()
        });
        if (res.error) {
            throw res.error;
        }
        if (!res.result?.output) {
            return null;
        }
        return {
            position: res.result.output[0],
            value: res.result.output[1],
            editor_address: res.result.output[2],
            editor_name: res.result.output[3]
        };
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
