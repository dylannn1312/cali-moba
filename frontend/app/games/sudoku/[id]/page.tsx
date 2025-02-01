'use client';
import { SudokuProvider } from "@/components/sudoku/context/SudokuContext";
import { SudokuGame } from "@/components/sudoku/Game";
import "./App.css"
import { Button, Menu, MenuProps, Progress, ProgressProps, Spin, Typography } from "antd";
import PeopleIcon from "@/components/common/icons/PeopleIcon";
import HiddenCopyableText from "@/components/common/HiddenCopyableText";
import { shortAddress } from "@/utils/chain";
import { useState } from "react";
import Image from "next/image";
import InfoIcon from "@/components/common/icons/InfoIcon";
import ArrowDownIcon from "@/components/common/icons/ArrowDownIcon";
import TransactionIcon from "@/components/common/icons/TransactionIcon";
import { THEME } from "@/styles/theme";
import { toast } from "react-toastify";
import { isUndefined, set } from "lodash";
import { GameAPI } from "@/api/gameAPI";
import { LoadingOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

type MenuItem = Required<MenuProps>['items'][number];

const menuItems: MenuItem[] = [
    {
        label: <span className='hover:!text-muted font-bold text-xl'>GAME</span>,
        key: 'game',

    },
    {
        label: <span className='hover:!text-muted font-bold text-xl'>RANK</span>,
        key: 'rank',
    }
];

export default function SudokuGamePage({ params: {
    id: room_id
} }: { params: { id: string } }) {

    const [currentPage, setCurrentPage] = useState('game');
    const onClick: MenuProps['onClick'] = (e) => {
        setCurrentPage(e.key);
    };

    const [roomInfo, setRoomInfo] = useState({
        depositPrice: 0.1,
        players: ["xion15n98r9fgxrysepr4qnw4m0zjf0yh4w7deagq44"],
        maxPlayers: 1,
    });
    const [txHashes, setTxHashes] = useState([{
        "description": "Create room",
        "txHash": localStorage.getItem("createRoomTxHash") || "0x",
    }, {
        "description": "Join room",
        "txHash": localStorage.getItem("joinRoomHash") || "0x",
    }]);
    const [gameStarted, setGameStarted] = useState(false);
    const [waitForStartingGame, setWaitForStartingGame] = useState(false);

    return (
        <main className="flex flex-col mt-8 gap-8">
            <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                    <Image src={"https://brainium.com/wp-content/uploads/2021/11/sudoku-Mobile-hero-asset@2x.png"} alt={""} width={50} height={50} />
                    <Title level={1} className="!mb-0">Sudoku #{room_id}</Title>
                </div>
                <HiddenCopyableText textToCopy={process.env.SUDOKU_CONTRACT}>
                    <Text className="text-muted font-semibold">
                        Deployed at: &nbsp;
                        <Text className="text-muted font-normal">{shortAddress(process.env.SUDOKU_CONTRACT, 8)}</Text>
                    </Text>
                </HiddenCopyableText>
            </div>
            <div className="flex gap-8">
                <div className="flex flex-col gap-8 flex-1">
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2 items-center cursor-pointer">
                            <InfoIcon className="fill-blue-500" />
                            <Title className="!mb-0 !text-current flex-1" level={3}>Room info</Title>
                            <ArrowDownIcon />
                        </div>
                        <div className="w-full bg-gray-600 h-[1px]"></div>
                        <div className="flex text-muted">
                            <Text className="flex-1 font-semibold">Deposit price</Text>
                            <Text className="uppercase font-semibold">{roomInfo.depositPrice}</Text>
                            &nbsp; <Text className="uppercase">{process.env.TOKEN}</Text>
                        </div>
                        <div className="flex text-muted">
                            <Text className="flex-1 font-semibold">Current prize pool</Text>
                            <Text className="font-semibold">{roomInfo.depositPrice * roomInfo.players.length}</Text>
                            &nbsp; <Text className="uppercase">{process.env.TOKEN}</Text>
                        </div>
                        <div className="flex text-muted">
                            <Text className="flex-1 font-semibold">Room size</Text>
                            <Text className="font-semibold">{roomInfo.maxPlayers}</Text>
                            &nbsp; <Text className="uppercase">players</Text>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2 items-center text-green-600 cursor-pointer">
                            <PeopleIcon />
                            <Title className="!mb-0 !text-current flex-1" level={3}>Players ({roomInfo.players.length}/{roomInfo.maxPlayers})</Title>
                            <ArrowDownIcon />
                        </div>
                        <div className="w-full bg-gray-600 h-[1px]"></div>
                        {
                            roomInfo.players.map((address) => (
                                <HiddenCopyableText textToCopy={address} key={address}>
                                    <Text className="text-muted font-semibold">{address}</Text>
                                </HiddenCopyableText>
                            ))
                        }
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2 items-center cursor-pointer">
                            <TransactionIcon className="fill-primary" />
                            <Title className="!mb-0 !text-current flex-1" level={3}>Transaction hashes</Title>
                            <ArrowDownIcon />
                        </div>
                        <div className="w-full bg-gray-600 h-[1px]"></div>
                        {
                            txHashes.map(({ txHash, description }) => (
                                <div className="flex font-semibold text-muted" key={txHash}>
                                    <Text className="flex-1">{description}</Text>
                                    <HiddenCopyableText textToCopy={txHash}>
                                        <Text className="text-muted font-normal">{shortAddress(txHash)}</Text>
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
                                    <SudokuGame room_id={parseInt(room_id)} onVerifySuccess={handleVerifySuccess} onClaimSuccess={handleClaimSuccess} />
                                    :
                                    <div className="flex flex-col gap-4 items-center">
                                        <Progress type="circle" percent={roomInfo.players.length * 100 / roomInfo.maxPlayers} strokeColor={conicColors} />
                                        {
                                            roomInfo.players.length === roomInfo.maxPlayers ?
                                                <Text className="text-green-600 font-semibold text-xl">All players are in the room now</Text>
                                                : <Text className="text-muted font-semibold text-xl">Waiting for players to join...</Text>
                                        }
                                        <Button disabled={roomInfo.players.length !== roomInfo.maxPlayers || waitForStartingGame} type="primary" className="py-6" onClick={handleStartGame}>
                                            <div className="flex gap-2 items-center">
                                                {waitForStartingGame && <Spin spinning={waitForStartingGame} indicator={<LoadingOutlined spin />} />}
                                                <Text className="uppercase font-bold text-xl">
                                                    Start game
                                                </Text>
                                            </div>
                                        </Button>
                                    </div>
                            }
                        </div>
                    </div>
                </SudokuProvider>
            </div>
        </main>
    )

    async function handleStartGame() {
        // try {
        //     if (isUndefined(address)) {
        //         toast.error("Please connect to your wallet first");
        //     } else {
        //         setWaitForStartingGame(true);
        //         let txHash = await GameAPI.startGame([[0, 8], [1, 7], [7, 9], [14, 8], [17, 1]], parseInt(room_id));
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
