import { JsonRpcClient } from '@calimero-network/calimero-client';

export function calimeroClient(nodeUrl: string) {
    return new JsonRpcClient(
        nodeUrl,
        '/jsonrpc',
    );
}
