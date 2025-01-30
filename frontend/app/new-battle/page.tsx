'use client';

import { GameAPI } from "@/api/gameAPI";
import HiddenCopyableText from "@/components/common/HiddenCopyableText";
import ArrowLeftIcon from "@/components/common/icons/ArrowLeftIcon";
import SearchBar from "@/components/common/SearchBar/SearchBar";
import { THEME } from "@/styles/theme";
import { GameInfo } from "@/types/game";
import { shortAddress } from "@/utils/chain";
import { randInt } from "@/utils/math";
import { Button, Col, Divider, Input, InputNumber, Row, Select, Typography } from "antd";
import { isUndefined } from "lodash";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";

const { Title, Text } = Typography;

const allGames: Pick<GameInfo, 'name' | 'slug' | 'icon' | 'totalPrizePool' | 'largestPrizePool' | 'playingRooms' | 'contractAddress' | 'splashImg'>[] = [
    {
        name: "Sudoku",
        slug: "sudoku",
        icon: "https://brainium.com/wp-content/uploads/2021/11/sudoku-Mobile-hero-asset@2x.png",
        totalPrizePool: randInt(1000, 10000),
        largestPrizePool: 600,
        playingRooms: randInt(3, 10),
        contractAddress: process.env.SUDOKU_CONTRACT,
        splashImg: "https://reactjsexample.com/content/images/2020/04/A-Sudoku-web-app-in-React.png"
    },
    {
        name: "Sokoban",
        slug: "sokoban",
        icon: "https://funhtml5games.com/sokoban/sokobon_trans.png",
        totalPrizePool: randInt(1000, 10000),
        largestPrizePool: 400,
        playingRooms: randInt(3, 10),
        contractAddress: process.env.SUDOKU_CONTRACT,
        splashImg: "https://static.tvtropes.org/pmwiki/pub/images/sokoban_6694.png"
    }
];

export default function NewRoomPage() {
    const {
        data: serviceFee,
        isLoading
    } = useSWR("service-fee", GameAPI.getServiceFee);

    const router = useRouter();

    // const { address, getSigningCosmWasmClient } = useChain(process.env.CHAIN_NAME);

    const [depositPrice, setDepositPrice] = useState(0);
    const [maxPlayers, setMaxPlayers] = useState(0);
    const [difficulty, setDifficulty] = useState('Easy');
    const [selectedGame, setSelectedGame] = useState(0);
    const [creatingRoom, setCreatingRoom] = useState(false);
    const [joiningRoom, setJoiningRoom] = useState(false);

    return (
        <div className={"flex flex-col mt-8"}>
            <Title level={2} className="flex items-center cursor-pointer" onClick={() => router.back()}>
                <ArrowLeftIcon color={THEME.PRIMARY_COLOR} />
                Create your room
            </Title>
            <div className={"flex gap-8"}>
                <div className={"flex flex-1 flex-col gap-4"}>
                    <div className="rounded-xl p-4 shadow-md flex flex-col gap-4 bg-secondary">
                        <div className="flex flex-col">
                            <Title level={5}>Deposit price</Title>
                            <InputNumber
                                placeholder="Enter deposit price"
                                className="h-[40px] w-full border-2"
                                suffix={
                                    <Text className="text-muted uppercase">
                                        {process.env.DENOM}
                                    </Text>
                                }
                                onChange={(value) => setDepositPrice(value as number)}
                            />
                        </div>
                        <div className="flex flex-col">
                            <Title level={5}>Number of players</Title>
                            <InputNumber
                                placeholder="Enter the maximum number of players"
                                className="h-[40px] w-full border-2"
                                suffix={
                                    <Text className="text-muted uppercase">
                                        player
                                    </Text>
                                }
                                onChange={(value) => setMaxPlayers(Math.floor(value as number))}
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
                    <div className="rounded-xl shadow-md py-4 bg-secondary">
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
                                <Text className="uppercase">{process.env.DENOM}</Text>
                            </div>
                            <div className="flex text-muted gap-1 items-center text-base">
                                <Text className="flex-1">Number of players</Text>
                                <Text strong className="text-text uppercase">{maxPlayers}</Text>
                                <Text className="uppercase">player</Text>
                            </div>
                            <div className="flex text-muted gap-1 items-center text-base">
                                <Text className="flex-1">Service fee</Text>
                                <Text strong className="text-text uppercase">{serviceFee}</Text>
                                <Text className="uppercase">{process.env.DENOM}</Text>
                            </div>
                            <div className="flex gap-1 items-center text-base">
                                <Title className="flex-1" level={4}>Total</Title>
                                <Text strong className="uppercase">{depositPrice + (serviceFee ?? 0)}</Text>
                                <Text className="uppercase text-muted">{process.env.DENOM}</Text>
                            </div>
                            <Button type="primary" className="w-full mt-3 h-[50px]" disabled={depositPrice === 0 || maxPlayers === 0 || creatingRoom || joiningRoom } onClick={handleConfirm}>
                                <strong className="text-2xl">{creatingRoom ? "Creating room..." : (joiningRoom ? "Joining room..." : "Confirm")}</strong>
                            </Button>
                        </div>
                    </div>

                </div>
                <div className="flex-1 flex flex-col p-4 rounded-xl gap-6 bg-secondary">
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
                                <HiddenCopyableText textToCopy={allGames[selectedGame].contractAddress}>
                                    <Text className="text-muted font-semibold">{shortAddress(allGames[selectedGame].contractAddress)}</Text>
                                </HiddenCopyableText>
                            </div>
                            <div className="flex text-muted gap-1 items-center text-base">
                                <Text className="flex-1">Total prize pool: </Text>
                                <Text className="text-green-600" strong>{allGames[selectedGame].totalPrizePool}</Text>
                                <Text className="uppercase ">{process.env.DENOM}</Text>
                            </div>
                            <div className="flex text-muted gap-1 items-center text-base">
                                <Text className="flex-1">Largest pool: </Text>
                                <Text className="text-green-600" strong>{allGames[selectedGame].largestPrizePool}</Text>
                                <Text className="uppercase ">{process.env.DENOM}</Text>
                            </div>
                            <div className="flex text-muted gap-1 items-center text-base">
                                <Text className="flex-1">Playing rooms: </Text>
                                <Text className="text-green-600" strong>{allGames[selectedGame].playingRooms}</Text>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    async function handleConfirm() {
        try {
            // if (isUndefined(serviceFee)) {
            //     toast.error("Service fee is not available");
            // } else if (isUndefined(address)) {
            //     toast.error("Please connect to your wallet first");
            // } else {
            //     const client = await getSigningCosmWasmClient();
            //     setCreatingRoom(true);
            //     GameAPI.createNewRoom(depositPrice, address).then(({room_id, tx_hash: createRoomTxHash}) => {
            //         setCreatingRoom(false);
            //         localStorage.setItem("createRoomTxHash", createRoomTxHash);
            //         setJoiningRoom(true);
            //         return client.execute(
            //             address,
            //             allGames[selectedGame].contractAddress,
            //             {
            //                 join_room: {
            //                     room_id
            //                 }
            //             },
            //             calculateFee(200000, gasPrice),
            //             undefined,
            //             coins((depositPrice + serviceFee) * 1_000_000, `u${process.env.DENOM}`)
            //         ).then((tx) => {
            //             setJoiningRoom(false);
            //             localStorage.setItem("joinRoomHash", tx.transactionHash);
            //             router.push(`/games/sudoku/${room_id}`);
            //         });
            //     })
            //     .catch((error) => {
            //         setCreatingRoom(false);
            //         if (error instanceof Error) {
            //             toast.error(error.message);
            //         } else {
            //             toast.error("unknown error");
            //         }
            //     });
            // }

        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("unknown error");
            }
        }
    }
}
