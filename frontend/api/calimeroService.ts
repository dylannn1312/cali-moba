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

export class SudokuCaller {
    private client: JsonRpcClient;

    constructor(nodeUrl: string) {
        this.client = calimeroClient(nodeUrl);
    }

    async set(position: number, value: number, editor_address: string) {
        return await this.client.execute({
            contextId: getStoragePanic(StorageKey.CONTEXT_ID),
            method: "set",
            argsJson: {
                position,
                value,
                editor_address
            },
            executorPublicKey: getJWTObject().executor_public_key
        }, {
            headers: getHeaders()
        });
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
