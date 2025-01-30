'use client';

import { HttpAgent } from "@dfinity/agent";
import { IdentityKitProvider } from "@nfid/identitykit/react";
import "@nfid/identitykit/react/styles.css";
import { useEffect, useState } from "react";

export default function IcWalletProvider({
    children
}: {
    children: React.ReactNode;
}) {
    const [unauthenticatedAgent, setUnauthenticatedAgent] = useState<HttpAgent | undefined>();

    useEffect(() => {
        HttpAgent.create({ host: process.env.ICP_API_HOST }).then(setUnauthenticatedAgent)
    }, [])

    return (
        <IdentityKitProvider
            // signers={[NFIDW]}
            authType={'ACCOUNTS'}
        >
            {children}
        </IdentityKitProvider>
    );
}
