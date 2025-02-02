// import { getAppEndpointKey } from '../../utils/storage';
import { createAuthHeader } from '@/auth/headers';
import { getNearEnvironment } from '@/utils/node';
import { getStorage, StorageKey } from '@/utils/storage';
import axios, { AxiosError, AxiosInstance } from 'axios';
// import translations from '../../constants/en.global.json';
// import { createAppMetadata } from '../../utils/metadata';
// import { Signature } from 'starknet';
// import { getNearEnvironment } from '../../utils/node';
// import { createAuthHeader, Header } from '../../auth/headers';

// const t = translations.nodeDataSource;


export class CalimeroAdminAPI {
  private client: AxiosInstance;

  constructor(nodeUrl: string) {
    const httpService = axios.create({
        baseURL: nodeUrl
    });

    httpService.interceptors.response.use((response) => {
        return response.data;
    }, (error: AxiosError) => {
        if (error.response)
            return Promise.reject({
                status: error.response.status,
                data: error.response.data
            })
        return Promise.reject(error.request ? error.request : error.message)
    });

    this.client = httpService;
  }

  async joinContext(contextId: string, privateKey: string, invitationPayload: string): Promise<JoinContextResponse> {
    const headers = await createAuthHeader(
      contextId,
      getNearEnvironment(),
    );

    const response = await this.client.post<any, JoinContextResponse>(
      `/admin-api/contexts/join`,
      {
        privateKey,
        invitationPayload
      },
      {
        headers
      },
    );
    return response;
  }

  async getContextUsers(contextId: string): Promise<ContextUsersList> {
    const headers = await createAuthHeader(
      contextId,
      getNearEnvironment(),
    );

    const response = await this.client.get<any, ContextUsersList>(
      `/admin-api/contexts/${contextId}/users`,
      {
        headers
      },
    );
    return response;
  }
}

export enum Network {
  NEAR = 'NEAR',
  ETH = 'ETH',
  BNB = 'BNB',
  ARB = 'ARB',
  ZK = 'ZK',
  STARKNET = 'STARKNET',
  ICP = 'ICP',
}

export interface ContextClientKeysList {
  clientKeys: ClientKey[];
}

export interface ContextUsersList {
  contextUsers: User[];
}

export interface User {
  userId: string;
  joinedAt: number;
  contextId: string;
}

export interface Application {
  id: string;
  blob: string;
  version: string | null;
  source: string;
  contract_app_id: string | null;
  name: string | null;
  description: string | null;
  repository: string | null;
  owner: string | null;
}

export interface InstalledApplication {
  id: string;
  blob: string;
  version: string | null;
  source: string;
  metadata: number[];
}

export interface SigningKey {
  signingKey: string;
}

// This is most likely obsolete
export interface Context {
  applicationId: string;
  id: string;
  rootHash: String;
}

export interface CreateContextResponse {
  contextId: string;
  memberPublicKey: SigningKey;
}

export interface GetContextsResponse {
  contexts: Context[];
}

export interface RootKey {
  signingKey: string;
  createdAt: number;
}

export interface ETHRootKey extends RootKey {
  type: Network.ETH;
  chainId: number;
}

export interface NearRootKey extends RootKey {
  type: Network.NEAR;
}

export interface StarknetRootKey extends RootKey {
  type: String;
}

export interface IcpRootKey extends RootKey {
  type: Network.ICP;
}

interface NetworkType {
  type: Network;
  chainId?: number;
  walletName?: string;
}

export interface ApiRootKey {
  signing_key: string;
  wallet: NetworkType;
  created_at: number;
}

export interface ClientKey {
  signingKey: string;
  wallet: NetworkType;
  createdAt: number;
  applicationId: string;
}

interface Did {
  client_keys: ClientKey[];
  contexts: Context[];
  root_keys: ApiRootKey[];
}

export interface DidResponse {
  did: Did;
}

export interface GetInstalledApplicationsResponse {
  apps: InstalledApplication[];
}

export interface HealthRequest {
  url: String;
}

export interface HealthStatus {
  status: String;
}

export interface ContextStorage {
  sizeInBytes: number;
}

export interface DeleteContextResponse {
  isDeleted: boolean;
}

export interface JoinContextResponse {
  data: null;
}

export interface SignatureMessage {
  nodeSignature: String;
  publicKey: String;
}

export interface SignatureMessageMetadata {
  publicKey: String;
  nodeSignature: String;
  nonce: String;
  timestamp: number;
  message: string; //signed message by wallet
}

interface WalletTypeBase<T extends Uppercase<string>> {
  type: T;
}

interface ETHWalletType extends WalletTypeBase<'ETH'> {
  chainId: number;
}

interface NEARWalletType extends WalletTypeBase<'NEAR'> {
  networkId: string;
}

interface SNWalletType extends WalletTypeBase<'STARKNET'> {
  walletName: string;
}

interface IcpWalletType extends WalletTypeBase<'ICP'> {
  canisterId: string;
}
// TODO: Legacy code, refacture to be used as Interface
export type WalletType =
  | ETHWalletType
  | NEARWalletType
  | SNWalletType
  | IcpWalletType;

export namespace WalletType {
  export function NEAR({
    networkId = 'mainnet',
  }: {
    networkId?: string;
  }): WalletType {
    return { type: 'NEAR', networkId } as NEARWalletType;
  }

  export function ETH({ chainId = 1 }: { chainId?: number }): WalletType {
    return { type: 'ETH', chainId } as ETHWalletType;
  }

  export function STARKNET({
    walletName = 'MS',
  }: {
    walletName?: string;
  }): WalletType {
    return { type: 'STARKNET', walletName } as SNWalletType;
  }

  // ID of production ICP canister used for signing messages
  const IcpCanisterId = 'rdmx6-jaaaa-aaaaa-aaadq-cai';

  export function ICP({
    canisterId = IcpCanisterId,
    walletName = 'II',
  }: {
    canisterId?: string;
    walletName?: string;
  }): WalletType {
    return {
      type: 'ICP',
      canisterId,
      walletName,
    } as IcpWalletType;
  }
}

export interface WalletMetadata {
  wallet: WalletType;
  verifyingKey: String;
  walletAddress?: String;
  networkMetadata?: NetworkMetadata;
}

export interface NetworkMetadata {
  chainId: String;
  rpcUrl: String;
  canisterId?: String;
}

export interface Payload {
  message: SignatureMessageMetadata;
  metadata: SignatureMetadata;
}

export interface SignData {
  // signature: Signature;
  messageHash: String;
}

export interface LoginRequest {
  walletSignature: SignData | string;
  payload: Payload;
  walletMetadata: WalletMetadata;
}

export interface LoginResponse { }
export interface RootKeyResponse { }
export interface SignatureMetadata { }

export interface NodeChallenge {
  nonce: String;
  contextId: String;
  timestamp: number;
  nodeSignature: String;
}

export interface NearSignatureMessageMetadata extends SignatureMetadata {
  recipient: String;
  callbackUrl: String;
  nonce: String;
}

export interface EthSignatureMessageMetadata extends SignatureMetadata { }

export interface StarknetSignatureMessageMetadata extends SignatureMetadata { }

export interface IcpSignatureMessageMetadata extends SignatureMetadata { }

export interface WalletSignatureData {
  payload: Payload | undefined;
  publicKey: String | undefined;
}

export interface InstallApplicationResponse {
  applicationId: string;
}

export interface UninstallApplicationResponse
  extends InstallApplicationResponse { }

export interface ContextIdentitiesResponse {
  identities: string[];
}

export interface JsonWebToken {
  accessToken: string;
  refreshToken: string;
}

export interface CreateTokenResponse {
  data: JsonWebToken;
}
