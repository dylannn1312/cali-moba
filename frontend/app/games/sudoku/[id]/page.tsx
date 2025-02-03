'use client';
import { SudokuProvider } from "@/components/sudoku/context/SudokuContext";
import { SudokuGame } from "@/components/sudoku/Game";
import "./App.css"
import { Button, Menu, MenuProps, Progress, ProgressProps, Spin, Typography } from "antd";
import PeopleIcon from "@/components/common/icons/PeopleIcon";
import HiddenCopyableText from "@/components/common/HiddenCopyableText";
import { shortAddress } from "@/utils/chain";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import InfoIcon from "@/components/common/icons/InfoIcon";
import ArrowDownIcon from "@/components/common/icons/ArrowDownIcon";
import TransactionIcon from "@/components/common/icons/TransactionIcon";
import { THEME } from "@/styles/theme";
import { toast } from "react-toastify";
import { LoadingOutlined } from "@ant-design/icons";
import { ClientLogin, WsSubscriptionsClient } from "@calimero-network/calimero-client";
import useSWR from "swr";
import { GameAPI } from "@/api/gameAPI";
import { useAuth } from "@nfid/identitykit/react";
import { getStorage, StorageKey } from "@/utils/storage";
import { usePathname, useRouter } from "next/navigation";
import PrivateChatIcon from "@/components/common/icons/PrivateChatIcon";
import { caliAdminService } from "@/api/calimero-admin";
import { get, isUndefined } from "lodash";
import { SudokuCaller } from "@/api/calimeroService";
import { SetSudokuValueEvent } from "@/types/battle";

const { Title, Text } = Typography;

type MenuItem = Required<MenuProps>['items'][number];

const menuItems: MenuItem[] = [
    {
        label: <span className='hover:!text-muted font-bold text-xl'>GAME</span>,
        key: 'game',
    },
    {
        label: <span className='hover:!text-muted font-bold text-xl'>CHAT</span>,
        key: 'chat',
    },
    {
        label: <span className='hover:!text-muted font-bold text-xl'>RANK</span>,
        key: 'rank',
    },
];

export default function SudokuGamePage({ params: {
    id: battleIdStr
} }: { params: { id: string } }) {
    const battleId = parseInt(battleIdStr);

    const router = useRouter();
    const pathName = usePathname();

    const {
        data: battleInfo,
        isLoading: isBattleInfoLoading
    } = useSWR(["battle-info", battleId], ([_, battleId]) => GameAPI.getBattleInfo(battleId));
    const {
        data: gameInfo,
        isLoading
    } = useSWR("game-info", GameAPI.getGameInfo);

    const { user: currentWallet } = useAuth();

    const [currentPage, setCurrentPage] = useState('game');
    const onClick: MenuProps['onClick'] = (e) => {
        setCurrentPage(e.key);
    };

    const [txHashes, setTxHashes] = useState([{
        "description": "Create battle",
        "txHash": localStorage.getItem("createBattleTxHash") || "0x",
    }, {
        "description": "Join battle",
        "txHash": localStorage.getItem("joinBattleHash") || "0x",
    }]);
    const [gameStarted, setGameStarted] = useState(false);
    const [waitForStartingGame, setWaitForStartingGame] = useState(false);
    const [caliLogined, setCaliLogined] = useState(false);

    const sudokuCaller = useRef(new SudokuCaller(getStorage(StorageKey.NODE_URL)));
    const wsClient = useRef(new WsSubscriptionsClient(getStorage(StorageKey.NODE_URL), '/ws'));

    useEffect(() => {
        async function handle() {
            if (isUndefined(currentWallet)) {
                return;
            }

            // Connect to WebSocket
            await wsClient.current.connect();

            // Subscribe to application events
            wsClient.current.subscribe([getStorage(StorageKey.CONTEXT_ID)]);

            // Handle incoming events
            wsClient.current.addCallback((event) => {
                switch (event.type) {
                    case 'StateMutation':
                        toast.success(`State updated: ${event.data.newRoot}`);
                        break;
                    case 'ExecutionEvent':
                        const res: SetSudokuValueEvent = JSON.parse(new TextDecoder().decode(new Uint8Array(event.data.events[0].data)));
                        toast.success(`Execution event: ${JSON.stringify(res)}`);
                        break;
                }
            });

            // await sudokuCaller.current.set(1, 1, currentWallet.principal.toString());

        }

        handle();

        const wsClientCurrent = wsClient.current;
        return () => {
            wsClientCurrent.disconnect();
        }
    }, [currentWallet])


    return (
        <main className="flex flex-col mt-8 gap-8">
            <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                    <Image src={"https://brainium.com/wp-content/uploads/2021/11/sudoku-Mobile-hero-asset@2x.png"} alt={""} width={50} height={50} />
                    <Title level={1} className="!mb-0">Sudoku #{battleId}</Title>
                </div>
                <Text className="text-muted font-semibold">
                    Deployed at: &nbsp;
                    <Text className="text-muted font-normal">{gameInfo?.gameContract && gameInfo?.gameContract}</Text>
                </Text>
                <Text className="text-muted font-semibold">
                    Application ID: &nbsp;
                    <Text className="text-muted font-normal">{gameInfo?.applicationId}</Text>
                </Text>
            </div>
            <div className="flex gap-8">
                <div className="flex flex-col gap-10 flex-1">
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2 items-center cursor-pointer">
                            <InfoIcon className="fill-blue-500" />
                            <Title className="!mb-0 !text-current flex-1" level={3}>Battle info</Title>
                            <ArrowDownIcon />
                        </div>
                        <div className="w-full bg-gray-600 h-[1px]"></div>
                        <div className="flex text-muted">
                            <Text className="flex-1 font-semibold">Deposit price</Text>
                            <Text className="uppercase font-semibold">{battleInfo?.deposit_price}</Text>
                            &nbsp; <Text className="uppercase">{process.env.TOKEN}</Text>
                        </div>
                        <div className="flex text-muted">
                            <Text className="flex-1 font-semibold">Current prize pool</Text>
                            <Text className="font-semibold">{(battleInfo?.deposit_price ?? 0) * (battleInfo?.players?.length ?? 0)}</Text>
                            &nbsp; <Text className="uppercase">{process.env.TOKEN}</Text>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2 items-center text-[#AE9EFF] cursor-pointer">
                            <PrivateChatIcon />
                            <Title className="!mb-0 !text-current flex-1" level={3}>1 Members in team</Title>
                            <ArrowDownIcon />
                        </div>
                        <Text className="text-muted">
                            <Text className="font-semibold">Context ID: </Text>
                            <HiddenCopyableText textToCopy={getStorage(StorageKey.CONTEXT_ID)} iconProps={{ className: "text-muted" }}>
                                {shortAddress(getStorage(StorageKey.CONTEXT_ID), 15)}
                            </HiddenCopyableText>
                        </Text>
                        <div className="w-full bg-gray-600 h-[1px]"></div>
                        {
                            battleInfo?.players.map((address) => (
                                <div className="flex items-center text-muted font-semibold" key={address}>
                                    <Text className="flex-1">
                                        node 1
                                        {address === currentWallet?.principal.toString() &&
                                            <Text className="text-[#AE9EFF]"> (You)</Text>
                                        }
                                    </Text>
                                    <HiddenCopyableText textToCopy={address} iconProps={{ className: "text-muted" }}>
                                        {shortAddress(address, 15)}
                                    </HiddenCopyableText>
                                </div>
                            ))
                        }
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2 items-center text-green-600 cursor-pointer">
                            <PeopleIcon />
                            <Title className="!mb-0 !text-current flex-1" level={3}>{battleInfo?.players.length ?? 0} Players in the battle</Title>
                            <ArrowDownIcon />
                        </div>
                        <div className="w-full bg-gray-600 h-[1px]"></div>
                        {
                            battleInfo?.players.map((address) => (
                                <div className="flex items-center text-muted font-semibold" key={address}>
                                    <Text className="flex-1">
                                        node 1
                                        {address === currentWallet?.principal.toString() &&
                                            <Text className="text-green-600"> (You)</Text>
                                        }
                                    </Text>
                                    <HiddenCopyableText textToCopy={address} iconProps={{ className: "text-muted" }}>
                                        {shortAddress(address, 15)}
                                    </HiddenCopyableText>
                                </div>
                            ))
                        }
                    </div>
                </div>
                <SudokuProvider>
                    <div className="flex flex-col gap-8 flex-[2] ">
                        <Menu onClick={onClick} selectedKeys={[currentPage]} mode="horizontal" items={menuItems} className='border-b-transparent min-w-[200px]' />
                        <div className="items-center justify-center flex flex-col">
                            {
                                gameStarted ?
                                    <SudokuGame battleId={battleId} onVerifySuccess={handleVerifySuccess} onClaimSuccess={handleClaimSuccess} />
                                    :
                                    <div className="flex flex-col gap-4 items-center">
                                        {
                                            caliLogined ?
                                                <ClientLogin getNodeUrl={() => getStorage(StorageKey.NODE_URL)} getApplicationId={
                                                    () => gameInfo?.applicationId ?? null
                                                } sucessRedirect={() => { setCaliLogined(true); router.push(pathName); }} />
                                                :
                                                <Button disabled={waitForStartingGame} type="primary" className="py-6" onClick={handleStartGame}>
                                                    <div className="flex gap-2 items-center">
                                                        {waitForStartingGame && <Spin spinning={waitForStartingGame} indicator={<LoadingOutlined spin />} />}
                                                        <Text className="uppercase font-bold text-xl">
                                                            Start game
                                                        </Text>
                                                    </div>
                                                </Button>
                                        }
                                    </div>
                            }
                        </div>
                    </div>
                </SudokuProvider>
            </div>
        </main>
    )

    async function handleStartGame() {
        if (isUndefined(currentWallet)) {
            toast.error("Please connect to your wallet first");
            return;
        }
        try {
            await sudokuCaller.current.set(1, 3, currentWallet.principal.toString());
        } catch (err) {
            toast.error(err.message);
        }

        // try {
        //     if (isUndefined(address)) {
        //         toast.error("Please connect to your wallet first");
        //     } else {
        //         setWaitForStartingGame(true);
        //         let txHash = await GameAPI.startGame([[0, 8], [1, 7], [7, 9], [14, 8], [17, 1]], parseInt(battle_id));
        //         setTxHashes([...txHashes, { description: "Start game", txHash }]);
        //         setGameStarted(true);
        //     }
        // } catch (error) {
        //     if (error instanceof Error) {
        //         toast.error(error.message);
        //     } else {
        //         toast.error("unknown error");
        //     }
        // }
        // setWaitForStartingGame(false);
    }

    function handleVerifySuccess(txHash: string) {
        setTxHashes([...txHashes, { description: "Submit solution", txHash }]);
    }

    function handleClaimSuccess(txHash: string): void {
        setTxHashes([...txHashes, { description: "Claim reward", txHash }]);
    }
}

const conicColors: ProgressProps['strokeColor'] = {
    '0%': '#87d068',
    '50%': '#ffe58f',
    '100%': THEME.PRIMARY_COLOR,
};
