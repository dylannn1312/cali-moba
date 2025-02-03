'use client';

import { caliAdminService } from "@/api/calimero-admin";
import { GameAPI } from "@/api/gameAPI";
import HiddenCopyableText from "@/components/common/HiddenCopyableText";
import ArrowLeftIcon from "@/components/common/icons/ArrowLeftIcon";
import SearchBar from "@/components/common/SearchBar/SearchBar";
import { THEME } from "@/styles/theme";
import { GameInfo } from "@/types/game";
import { shortAddress, transfer } from "@/utils/chain";
import { randInt } from "@/utils/math";
import { getStorage, StorageKey } from "@/utils/storage";
import { Principal } from "@dfinity/principal";
import { useAccounts, useAgent, useAuth } from "@nfid/identitykit/react";
import { Button, Col, Divider, Input, InputNumber, Row, Select, Typography } from "antd";
import { isUndefined, set } from "lodash";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";

const { Title, Text } = Typography;

const allGames: Pick<GameInfo, 'name' | 'slug' | 'icon' | 'totalPrizePool' | 'largestPrizePool' | 'playingBattles' | 'splashImg'>[] = [
    {
        name: "Sudoku",
        slug: "sudoku",
        icon: "https://brainium.com/wp-content/uploads/2021/11/sudoku-Mobile-hero-asset@2x.png",
        totalPrizePool: randInt(1000, 10000),
        largestPrizePool: 600,
        playingBattles: randInt(3, 10),
        splashImg: "https://reactjsexample.com/content/images/2020/04/A-Sudoku-web-app-in-React.png"
    },
    {
        name: "Sokoban",
        slug: "sokoban",
        icon: "https://funhtml5games.com/sokoban/sokobon_trans.png",
        totalPrizePool: randInt(1000, 10000),
        largestPrizePool: 400,
        playingBattles: randInt(3, 10),
        splashImg: "https://static.tvtropes.org/pmwiki/pub/images/sokoban_6694.png"
    }
];

export default function NewBattlePage() {
    const {
        data: gameInfo,
        isLoading
    } = useSWR("game-info", GameAPI.getGameInfo);

    const router = useRouter();

    const { user: currentWallet } = useAuth();
    const icpAgent = useAgent({
        host: process.env.ICP_API_HOST
    });

    const [depositPrice, setDepositPrice] = useState(0);
    const [difficulty, setDifficulty] = useState('Easy');
    const [selectedGame, setSelectedGame] = useState(0);
    const [creatingTeam, setCreatingTeam] = useState(false);
    const [joiningTeam, setJoiningTeam] = useState(false);
    const [creatingBattle, setCreatingBattle] = useState(false);
    const [joiningBattle, setJoiningBattle] = useState(false);

    return (
        <div className={"flex flex-col mt-8"}>
            <Title level={2} className="flex items-center cursor-pointer" onClick={() => router.back()}>
                <ArrowLeftIcon color={THEME.PRIMARY_COLOR} />
                Create new battle
            </Title>
            <div className={"flex gap-8"}>
                <div className={"flex flex-1 flex-col gap-4"}>
                    <div className="rounded-xl p-4 shadow-md flex flex-col gap-4 bg-light-secondary">
                        <div className="flex flex-col">
                            <Title level={5}>Deposit price</Title>
                            <InputNumber
                                placeholder="Enter deposit price"
                                className="h-[40px] w-full border-2"
                                suffix={
                                    <Text className="text-muted uppercase">
                                        {process.env.TOKEN}
                                    </Text>
                                }
                                onChange={(value) => setDepositPrice(value as number)}
                            />
                        </div>

                        <div className="flex flex-col">
                            <Title level={5}>Difficulty</Title>
                            <Select
                                className="h-[40px] w-full"
                                defaultValue={difficulty}
                                onChange={(value) => setDifficulty(value)}
                                options={[
                                    {
                                        value: 'Easy'
                                    },
                                    {
                                        value: 'Medium'
                                    },
                                    {
                                        value: 'Hard'
                                    }
                                ]}
                            />

                        </div>
                    </div>
                    <div className="rounded-xl shadow-md py-4 bg-light-secondary">
                        <Title level={4} className="p-4">Summary</Title>
                        <div className="w-full bg-gray-300 h-[1px]"></div>
                        <div className="flex flex-col gap-3 p-4 ">
                            <div className="flex text-muted gap-1 items-center text-base">
                                <Text className="flex-1">Game</Text>
                                <Text strong className="text-text uppercase">{allGames[selectedGame].name}</Text>
                            </div>
                            <div className="flex text-muted gap-1 items-center text-base">
                                <Text className="flex-1">Difficulty</Text>
                                <Text strong className="text-text uppercase">{difficulty}</Text>
                            </div>
                            <div className="flex text-muted gap-1 items-center text-base">
                                <Text className="flex-1">Deposit price</Text>
                                <Text strong className="text-text uppercase">{depositPrice}</Text>
                                <Text className="uppercase">{process.env.TOKEN}</Text>
                            </div>
                            <div className="flex text-muted gap-1 items-center text-base">
                                <Text className="flex-1">Service fee</Text>
                                <Text strong className="text-text uppercase">{gameInfo?.serviceFee}</Text>
                                <Text className="uppercase">{process.env.TOKEN}</Text>
                            </div>
                            <div className="flex gap-1 items-center text-base">
                                <Title className="flex-1" level={4}>Total</Title>
                                <Text strong className="uppercase">{depositPrice + (gameInfo?.serviceFee ?? 0)}</Text>
                                <Text className="uppercase text-muted">{process.env.TOKEN}</Text>
                            </div>
                            <Button type="primary" className="w-full mt-3 h-[50px]" disabled={confirmable()} onClick={handleConfirm}>
                                <strong className="text-2xl text-text">{confirmText()}</strong>
                            </Button>
                        </div>
                    </div>

                </div>
                <div className="flex-1 flex flex-col p-4 rounded-xl gap-6 bg-light-secondary">
                    <Title level={4} className="!mb-0 uppercase">Select a game</Title>
                    <SearchBar placeholder="Search game by name" className="w-full" />

                    <div className="max-h-[320px] overflow-y-auto overflow-x-hidden">
                        <Row className="flex-wrap">
                            {
                                allGames.map((game, i) => {
                                    return (
                                        <Col key={game.name} span={6}>
                                            <div
                                                className={`cursor-pointer border-2 ${selectedGame == i ? 'border-primary' : ''} rounded-xl h-[150px] w-[150px] p-2 overflow-hidde`}
                                                onClick={() => setSelectedGame(i)}
                                            >
                                                <img
                                                    src={game.icon}
                                                    alt={game.name}
                                                    className="w-full h-full object-cover hover:scale-110 transform transition-transform duration-300"
                                                />
                                            </div>
                                        </Col>
                                    )
                                })
                            }
                        </Row>
                    </div>
                    <Title level={3}>{allGames[selectedGame].name}</Title>
                    <div className="flex gap-5">
                        <div className="flex-1 overflow-hidden rounded-xl shadow-md max-h-[250px]">
                            <img src={allGames[selectedGame].splashImg} alt="" className="h-full w-full" />
                        </div>
                        <div className="flex-1 flex flex-col gap-3">
                            <div className="flex text-muted gap-1 items-center text-base">
                                <Text className="flex-1">Contract: </Text>
                                <HiddenCopyableText textToCopy={gameInfo?.gameContract}>
                                    <Text className="text-muted font-semibold">{gameInfo?.gameContract && shortAddress(gameInfo?.gameContract)}</Text>
                                </HiddenCopyableText>
                            </div>
                            <div className="flex text-muted gap-1 items-center text-base">
                                <Text className="flex-1">Total prize pool: </Text>
                                <Text className="text-green-600" strong>{allGames[selectedGame].totalPrizePool}</Text>
                                <Text className="uppercase ">{process.env.TOKEN}</Text>
                            </div>
                            <div className="flex text-muted gap-1 items-center text-base">
                                <Text className="flex-1">Largest pool: </Text>
                                <Text className="text-green-600" strong>{allGames[selectedGame].largestPrizePool}</Text>
                                <Text className="uppercase ">{process.env.TOKEN}</Text>
                            </div>
                            <div className="flex text-muted gap-1 items-center text-base">
                                <Text className="flex-1">Playing battles: </Text>
                                <Text className="text-green-600" strong>{allGames[selectedGame].playingBattles}</Text>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    async function handleConfirm() {
        if (isUndefined(currentWallet) || isUndefined(icpAgent)) {
            toast.error("Please connect your wallet");
            return;
        }
        if (isUndefined(gameInfo)) {
            toast.error("Service fee is not available");
            return;
        }

        try {
            let nodeUrl = getStorage(StorageKey.NODE_URL);
            let nodePublicKey = getStorage(StorageKey.NODE_PUBLIC_KEY);
            let nodePrivateKey = getStorage(StorageKey.NODE_PRIVATE_KEY);

            setCreatingTeam(true);
            let {
                invitationPayload,
                contextId
            } = await GameAPI.createNewTeam(nodePublicKey);
            localStorage.setItem(StorageKey.CONTEXT_ID, contextId);
            setCreatingTeam(false);

            setJoiningTeam(true);
            await caliAdminService(nodeUrl).joinContext(contextId, nodePrivateKey, invitationPayload);
            toast.success(`Successfully joined context ${contextId}`);
            setJoiningTeam(false);

            setCreatingBattle(true);
            let transferRes = await transfer(icpAgent, Principal.fromText(gameInfo.gameContract), depositPrice + gameInfo.serviceFee);
            toast.info(`Transfer successful: ${transferRes}`);
            let battleId = await GameAPI.createNewBattle(depositPrice, currentWallet.principal);
            setCreatingBattle(false);

            setJoiningBattle(true);
            await GameAPI.joinBattle(battleId, currentWallet.principal);
            setJoiningBattle(false);

            router.push(`/games/sudoku/${battleId}`);
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error(JSON.stringify(error));
            }
        }
        setCreatingBattle(false);
        setJoiningBattle(false);
        setCreatingTeam(false);
        setJoiningTeam(false);
    }

    function confirmable() {
        return depositPrice === 0 || creatingBattle || joiningBattle || creatingTeam || joiningTeam;
    }

    function confirmText() {
        if (creatingBattle) {
            return "Creating battle...";
        }
        if (joiningBattle) {
            return "Joining battle...";
        }
        if (creatingTeam) {
            return "Creating team...";
        }
        if (joiningTeam) {
            return "Joining team...";
        }
        return "Confirm";
    }

}
