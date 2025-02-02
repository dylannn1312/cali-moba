import { StorageKey } from '@/utils/storage';
import { CalimeroAdminAPI } from './calimeroAdminAPI';

let cache: any = null;

export const caliAdminService = (nodeUrl?: string): CalimeroAdminAPI => {
    if (cache) {
        return cache;
    }

    if (!nodeUrl) {
        throw new Error('Node URL is required');
    }

    cache = new CalimeroAdminAPI(nodeUrl);
    return cache;
};
