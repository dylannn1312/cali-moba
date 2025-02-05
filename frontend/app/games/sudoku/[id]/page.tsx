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
import { THEME } from "@/styles/theme";
import { toast } from "react-toastify";
import { LoadingOutlined } from "@ant-design/icons";
import { ClientLogin, WsSubscriptionsClient } from "@calimero-network/calimero-client";
import useSWR from "swr";
import { GameAPI } from "@/api/gameAPI";
import { useAuth } from "@nfid/identitykit/react";
import { getStoragePanic, StorageKey } from "@/utils/storage";
import { usePathname, useRouter } from "next/navigation";
import PrivateChatIcon from "@/components/common/icons/PrivateChatIcon";
import { caliAdminService } from "@/api/calimero-admin";
import { get, isUndefined } from "lodash";
import { SudokuCaller } from "@/api/calimeroService";
import { SetSudokuValueEvent } from "@/types/battle";
import { SwishSpinner } from "@/components/common/SwishSpinner";

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

    const [gameStarted, setGameStarted] = useState(false);
    const [waitForStartingGame, setWaitForStartingGame] = useState(false);
    const [caliLogined, setCaliLogined] = useState(false);

    useEffect(() => {
      if (battleInfo?.initial_state) {
        setGameStarted(true);
      }
    }, [battleInfo?.initial_state]);


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
                            <Title className="!mb-0 !text-current flex-1" level={3}>{battleInfo?.players.length ?? 0} Members in team</Title>
                            <ArrowDownIcon />
                        </div>
                        <Text className="text-muted">
                            <Text className="font-semibold">Context ID: </Text>
                            <HiddenCopyableText textToCopy={getStoragePanic(StorageKey.CONTEXT_ID)} iconProps={{ className: "text-muted" }}>
                                {shortAddress(getStoragePanic(StorageKey.CONTEXT_ID), 15)}
                            </HiddenCopyableText>
                        </Text>
                        <Text className="text-muted">
                            <Text className="font-semibold">Context identity: </Text>
                            <HiddenCopyableText textToCopy={getStoragePanic(StorageKey.CONTEXT_IDENTITY)} iconProps={{ className: "text-muted" }}>
                                {shortAddress(getStoragePanic(StorageKey.CONTEXT_IDENTITY), 15)}
                            </HiddenCopyableText>
                        </Text>
                        <div className="w-full bg-gray-600 h-[1px]"></div>
                        {
                            battleInfo?.players.map((address) => (
                                <div className="flex items-center text-muted font-semibold" key={address}>
                                    <HiddenCopyableText textToCopy={address} iconProps={{ className: "text-muted" }}>
                                        {shortAddress(address, 23)}
                                    </HiddenCopyableText>
                                    {address === currentWallet?.principal.toString() &&
                                        <Text className="text-[#AE9EFF]">&nbsp; (You)</Text>
                                    }
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
                                    <HiddenCopyableText textToCopy={address} iconProps={{ className: "text-muted" }}>
                                        {shortAddress(address, 23)}
                                    </HiddenCopyableText>
                                    {address === currentWallet?.principal.toString() &&
                                        <Text className="text-green-600">&nbsp; (You)</Text>
                                    }
                                </div>
                            ))
                        }
                    </div>
                </div>
                <SudokuProvider>
                    <div className="flex flex-col gap-8 flex-[2] ">
                        <Menu onClick={onClick} selectedKeys={[currentPage]} mode="horizontal" items={menuItems} className='border-b-transparent min-w-[200px]' />
                        <div className={`items-center justify-center flex flex-col h-full rounded-lg py-10 ${gameStarted && caliLogined ? 'bg-white' : ''}`}>
                            {
                                gameStarted && caliLogined ?
                                    <SudokuGame battleId={battleId} onVerifySuccess={handleVerifySuccess} onClaimSuccess={handleClaimSuccess} />
                                    :
                                    <div className="flex flex-col gap-4 items-center">
                                        {
                                            !caliLogined ?
                                                <>
                                                <Text className="text-4xl font-bold text-primary">Authenticate your Calimero node</Text>
                                                <ClientLogin getNodeUrl={() => getStoragePanic(StorageKey.NODE_URL)} getApplicationId={
                                                    () => gameInfo?.applicationId ?? null
                                                } sucessRedirect={() => { setCaliLogined(true); router.push(pathName); }} />
                                                </>
                                                :
                                                (
                                                    battleInfo?.creator === currentWallet?.principal.toString() ?
                                                        <Button disabled={waitForStartingGame} type="primary" className="py-6" onClick={handleStartGame}>
                                                            <div className="flex gap-2 items-center">
                                                                {waitForStartingGame && <Spin spinning={waitForStartingGame} indicator={<LoadingOutlined spin />} />}
                                                                <Text className="uppercase font-bold text-xl">
                                                                    Start game
                                                                </Text>
                                                            </div>
                                                        </Button>
                                                        :
                                                        <>
                                                            <SwishSpinner />
                                                            <Text className="text-muted font-semibold text-xl">Waiting for the creator to start the game</Text>
                                                        </>
                                                )
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
            setWaitForStartingGame(true);
            await new Promise(r => setTimeout(r, 2000));
            setGameStarted(true);
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("unknown error");
            }
        }
        setWaitForStartingGame(false);
    }

    function handleVerifySuccess(txHash: string) {

    }

    function handleClaimSuccess(txHash: string): void {

    }
}

const conicColors: ProgressProps['strokeColor'] = {
    '0%': '#87d068',
    '50%': '#ffe58f',
    '100%': THEME.PRIMARY_COLOR,
};
