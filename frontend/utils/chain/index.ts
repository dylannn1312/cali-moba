import { Actor, Agent } from "@dfinity/agent";
import { fromHexString } from "@dfinity/candid";
import { AccountIdentifier } from "@dfinity/ledger-icp";
import { Principal } from "@dfinity/principal";
import { idlFactory } from "./icp_ledger_canister.did";

export function shortAddress(address: string, length: number = 6) {
    return `${address.slice(0, length)}...${address.slice(-length)}`;
}

export async function transfer(agent: Agent, to: Principal, smallAmount: number) {
    // agent will know which is the currently connected wallet

    // you'll need to import the idlFactory for ICP (or any other ledger canister)
    // and specify which canister you're calling, in this case the ICP ledger.
    // note: it would be very helpful to have a common 'ICRCledgerFactory'
    // so individual ledger canister idl's don't need to be imported.
    const actor = Actor.createActor(idlFactory, {
        agent,
        canisterId: process.env.ICP_LEDGER_CANISTER_ID,
    })

    const address = AccountIdentifier.fromPrincipal({
        principal: to,
    }).toHex();

    const response = await actor.transfer({
        to: fromHexString(address),
        fee: { e8s: BigInt(10000) },
        memo: BigInt(0),
        from_subaccount: [],
        created_at_time: [],
        amount: { e8s: BigInt(smallAmount * process.env.TOKEN_DECIMALS) },
    });

    return response;
}
