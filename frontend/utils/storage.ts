// import apiClient from '../api';
// import { HealthStatus } from '../api/dataSource/NodeDataSource';
// import { ResponseData } from '../api/response';

import { isUndefined } from "lodash";
import { toast } from "react-toastify";

// export const APP_URL = 'app-url';
// const AUTHORIZED = 'node-authorized';
// const CLIENT_KEY = 'client-key';
// const NODE_URL = 'node-url';

// export interface ClientKey {
//   privateKey: string;
//   publicKey: string;
// }

// export const clearStorage = () => {
//   localStorage.removeItem(APP_URL);
//   localStorage.removeItem(AUTHORIZED);
//   localStorage.removeItem(CLIENT_KEY);
// };

// export const getAppEndpointKey = (): string | null => {
//   try {
//     if (typeof window !== 'undefined' && window.localStorage) {
//       let storageRecord: string | null = localStorage.getItem(APP_URL);
//       if (storageRecord) {
//         let url: string = JSON.parse(storageRecord);
//         if (url && url.length > 0) {
//           return url;
//         }
//       }
//     }
//     return null;
//   } catch (e) {
//     return null;
//   }
// };

// export const setAppEndpointKey = (url: string) => {
//   localStorage.setItem(APP_URL, JSON.stringify(url));
// };

// export const getClientKey = (): String => {
//   return localStorage.getItem(CLIENT_KEY) ?? '';
// };

// export const isNodeAuthorized = (): boolean => {
//   const authorized = localStorage.getItem(AUTHORIZED);
//   return authorized ? JSON.parse(authorized) : false;
// };

// export const setNodeUrlFromQuery = async (showServerDownPopup: () => void) => {
//   const urlParams = new URLSearchParams(window.location.search);
//   const nodeUrl = urlParams.get(NODE_URL);
//   if (nodeUrl && (await verifyNodeUrl(nodeUrl, showServerDownPopup))) {
//     setAppEndpointKey(nodeUrl);
//     const newUrl = `${window.location.pathname}auth`;
//     window.location.href = newUrl;
//   } else if (!nodeUrl) {
//     return;
//   } else {
//     window.alert('Node URL is not valid or not reachable. Please try again.');
//   }
// };

// const verifyNodeUrl = async (
//   url: string,
//   showServerDownPopup: () => void,
// ): Promise<boolean> => {
//   try {
//     new URL(url);
//     const response: ResponseData<HealthStatus> = await apiClient(
//       showServerDownPopup,
//     )
//       .node()
//       .health({ url: url });
//     if (response.data) {
//       return true;
//     }
//     return false;
//   } catch (error) {
//     return false;
//   }
// };

// export const getStorageClientKey = (): ClientKey | null => {
//   if (typeof window !== 'undefined' && window.localStorage) {
//     const clientKey = localStorage.getItem(CLIENT_KEY);
//     if (!clientKey) {
//       return null;
//     }
//     let clientKeystore: ClientKey = JSON.parse(clientKey);
//     if (clientKeystore) {
//       return clientKeystore;
//     }
//   }
//   return null;
// };

export enum StorageKey {
    NODE_URL = "node-url",
    NODE_NAME = "node-name",
    NODE_PUBLIC_KEY = "node-public-key",
    NODE_PRIVATE_KEY = "node-private-key",
    ACCESS_TOKEN = "access-token",
    CONTEXT_ID = "context-id",
    CONTEXT_IDENTITY = "context-identity",
}

export function getStoragePanic(key: StorageKey): string {
    if (typeof window !== "undefined" && window.localStorage) {
        let item = localStorage.getItem(key);
        if (!item) {
            throw new Error(`Storage key ${key} not found`);
        }
        if (key === StorageKey.ACCESS_TOKEN) {
            item = item.replace(/"/g, '');
        }
        return item;
    }
    return '';
}

export function getStorage(key: StorageKey): string | null {
    if (typeof window !== "undefined" && window.localStorage) {
        return localStorage.getItem(key);
    }
    return null;
}

export function isInClient() {
    return typeof window !== "undefined";
}
