'use client';

import SearchBar from "@/components/common/SearchBar/SearchBar";
import BattleCard from "@/components/home/BattleCard";
import ArrowDownIcon from "@/components/common/icons/ArrowDownIcon";
import { GameInfo } from "@/types/game";
import { BattleInfo, BattleStatus } from "@/types/battle";
import { randInt } from "@/utils/math";
import { Button, Checkbox, Col, Input, InputNumber, Modal, Row, Typography } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BattleIcon from "@/components/common/icons/BattleIcon";
import EnterIcon from "@/components/common/icons/EnterIcon";
import { useState } from "react";
import { getStoragePanic, StorageKey } from "@/utils/storage";
import { caliAdminService } from "@/api/calimero-admin";
import { toast } from "react-toastify";
import { GameAPI } from "@/api/gameAPI";
import { isUndefined, set } from "lodash";
import { transfer } from "@/utils/chain";
import useSWR from "swr";
import { Principal } from "@dfinity/principal";
import { useAgent, useAuth } from "@nfid/identitykit/react";
import { Router } from "next/router";

const { Text, Title } = Typography;

const allGames: Pick<GameInfo, 'playingBattles' | 'icon' | 'name'>[] = [
  {
    icon: "https://brainium.com/wp-content/uploads/2021/11/sudoku-Mobile-hero-asset@2x.png",
    playingBattles: randInt(30, 100),
    name: "Sudoku"
  },
  {
    icon: "https://funhtml5games.com/sokoban/sokobon_trans.png",
    playingBattles: randInt(30, 100),
    name: "Sokoban"
  }
]

const allBattles: BattleInfo[] = [
  {
    idByGame: 1,
    creator: "wqfln-yypmj-vw5mk-psdyt-5mnmz-ypeiz-ly5gb-gzhz4-ulzg5-ylhel-uqe",
    status: BattleStatus.Pending,
    playerCount: 2,
    gameInfo: {
      splashImg: "https://reactjsexample.com/content/images/2020/04/A-Sudoku-web-app-in-React.png",
      name: "Sudoku",
      slug: "sudoku"
    },
    depositPrice: 10
  },
  {
    idByGame: 1,
    creator: "wqfln-yypmj-vw5mk-psdyt-5mnmz-ypeiz-ly5gb-gzhz4-ulzg5-ylhel-uqe",
    status: BattleStatus.Finished,
    playerCount: 3,
    gameInfo: {
      splashImg: "https://static.tvtropes.org/pmwiki/pub/images/sokoban_6694.png",
      name: "Sokoban",
      slug: "sokoban"
    },
    depositPrice: 23
  },
  {
    idByGame: 2,
    creator: "wqfln-yypmj-vw5mk-psdyt-5mnmz-ypeiz-ly5gb-gzhz4-ulzg5-ylhel-uqe",
    status: BattleStatus.Playing,
    playerCount: 2,
    gameInfo: {
      splashImg: "https://reactjsexample.com/content/images/2020/04/A-Sudoku-web-app-in-React.png",
      name: "Sudoku",
      slug: "sudoku"
    },
    depositPrice: 30.5
  },
]

export default function Home() {
  const router = useRouter();

  return (
    <section className="flex flex-col md:flex-row md:gap-6 pt-6 max-w-[1920px] mx-auto">
      <div className="backdrop-blur-lg flex flex-col gap-8 w-full pb-2 md:w-[16rem] z-40 sticky top-[142px] md:top-[110px] md:overflow-auto md:h-[calc(100vh-180px)] scrollbar-none">
        <Button className="flex items-center gap-2 py-5" type="primary" onClick={() => router.push('/new-battle')}>
          <BattleIcon />
          <p className="text-sm font-bold max-w-lg uppercase">New battle</p>
        </Button>
        {/* <SearchBar className="w-full" /> */}
        <div className="flex flex-col gap-6 pb-10 font-medium">
          <div className="flex flex-col gap-4">
            <div className="flex items-center cursor-pointer">
              <Text strong className="flex-1">Games</Text>
              <ArrowDownIcon />
            </div>
            {
              allGames.map((game) => (
                <div className="flex items-center gap-2 text-muted cursor-pointer hover:text-text" key={game.name}>
                  <Checkbox></Checkbox>
                  <Image src={game.icon} alt="" width={25} height={25} className="rounded-full" />
                  <Text className="flex-1 text-inherit uppercase">{game.name}</Text>
                  <Text className="text-inherit">{game.playingBattles}</Text>
                </div>
              ))
            }
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center cursor-pointer">
              <Text strong className="flex-1">Status</Text>
              <ArrowDownIcon />
            </div>
            {
              [BattleStatus.Playing, BattleStatus.Pending, BattleStatus.Finished].map((battleStatus) => (
                <div className="flex items-center gap-2 text-muted cursor-pointer hover:text-text" key={battleStatus}>
                  <Checkbox></Checkbox>
                  <Text className="flex-1 text-inherit uppercase">{battleStatus}</Text>
                  <Text className="text-inherit">{randInt(30, 100)}</Text>
                </div>
              ))
            }
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-8">
        <div className="flex flex-row justify-between items-start">
          <div>
            <h3 className="text-xl md:text-2xl font-bold">All battles</h3>
            <span className="text-muted text-sm md:text-md">{allBattles.length}+ battles</span>
          </div>
          <div className="flex justify-end">
            <div className="relative" data-headlessui-state="">
              <button
                className="flex gap-2 items-center transition-all p-2 rounded-md hover:bg-button-hover text-sm border-2 bg-transparent border-transparent"
              >
                <span className="font-bold">Sort by</span>
                <span>Most recent</span>
                <ArrowDownIcon />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-5">
          <SearchBar placeholder="Search by battle ID, game, ..." className="flex-1 rounded-md" />
          <JoinBattleButton />
        </div>
        <div
          className="grid grid-cols-2 items-start lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 flex-1 mb-4">
          {
            allBattles?.map((battle) => (
              <BattleCard key={battle.idByGame + battle.gameInfo.name} {...battle} />
            ))
          }
        </div>
      </div>
    </section>
  );
}

function JoinBattleButton() {
  const {
    data: gameInfo,
    isLoading
  } = useSWR("game-info", GameAPI.getGameInfo);

  const router = useRouter();

  const { user: currentWallet } = useAuth();
  const icpAgent = useAgent({
    host: process.env.ICP_API_HOST
  });

  const [open, setOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(0);
  const [battleId, setBattleId] = useState(-1);
  const [contextId, setContextId] = useState('');
  const [contextIdentity, setContextIdentity] = useState('');
  const [joiningTeam, setJoiningTeam] = useState(false);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [battleInfo, setBattleInfo] = useState<{
    creator: string,
    deposit_price: number,
    service_fee: number,
  } | null>(null);

  return (
    <>
      <Button type="primary" className="font-bold uppercase h-full flex items-center" onClick={() => setOpen(true)}>
        <EnterIcon />
        Join a battle
      </Button>
      <Modal
        open={open}
        width={600}
        footer={[]}
        closeIcon={null}
        classNames={{
          content: '!p-0 !rounded-xl !bg-transparent',
        }}
        onCancel={() => setOpen(false)}
      >
        <div className="flex flex-col gap-8 bg-light-secondary rounded-lg p-5">
          <Title level={2} className="text-center">Join a battle</Title>
          <SearchBar placeholder="Search game by name" className="w-full" />

          <div className="max-h-[320px] overflow-y-auto overflow-x-hidden w-full">
            <Row className="flex-wrap w-full">
              {
                allGames.map((game, i) => {
                  return (
                    <Col key={game.name} span={7}>
                      <div
                        className={`cursor-pointer border-2 ${selectedGame == i ? 'border-primary' : ''} rounded-xl h-[150px] w-[150px] p-2 overflow-hidden`}
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
          <div className="flex flex-col">
            <Title level={5}>Battle ID</Title>
            <Input
              placeholder="Enter battle ID"
              className="h-[40px] w-full border-2"
              onChange={(value) => handleBattleId(parseInt(value.target.value))}
            />
          </div>
          <div className="flex flex-col">
            <Title level={5}>Enter context ID to join your team</Title>
            <Input
              placeholder="Enter context ID"
              className="h-[40px] w-full border-2"
              onChange={(value) => setContextId(value.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <Title level={5}>Enter context identity to join your team</Title>
            <Input
              placeholder="Enter context identity"
              className="h-[40px] w-full border-2"
              onChange={(value) => setContextIdentity(value.target.value)}
            />
          </div>

          <div>
            <Title level={4} className="p-4">Summary</Title>
            <div className="w-full bg-gray-300 h-[1px]"></div>
            <div className="flex flex-col gap-3 p-4 ">
              <div className="flex text-muted gap-1 items-center text-base">
                <Text className="flex-1">Game</Text>
                <Text strong className="text-text uppercase">{allGames[selectedGame].name}</Text>
              </div>
              <div className="flex text-muted gap-1 items-center text-base">
                <Text className="flex-1">Deposit price</Text>
                <Text strong className="text-text uppercase">{battleInfo?.deposit_price}</Text>
                <Text className="uppercase">{process.env.TOKEN}</Text>
              </div>
              <div className="flex text-muted gap-1 items-center text-base">
                <Text className="flex-1">Service fee</Text>
                <Text strong className="text-text uppercase">{battleInfo?.service_fee}</Text>
                <Text className="uppercase">{process.env.TOKEN}</Text>
              </div>
              <div className="flex gap-1 items-center text-base">
                <Title className="flex-1" level={4}>Total</Title>
                <Text strong className="uppercase">{(battleInfo?.deposit_price ?? 0) + (battleInfo?.service_fee ?? 0)}</Text>
                <Text className="uppercase text-muted">{process.env.TOKEN}</Text>
              </div>
            </div>
          </div>

          <div className="flex gap-5 w-full font-bold">
            <Button type="primary" disabled={battleId < 0 || !contextId || !contextIdentity || joiningTeam || creatingTeam} size="large" className="uppercase flex-1" onClick={handleJoinTeam}>
              {joiningTeam ? 'Joining team...' : 'Join your team'}
            </Button>
            <Button type="primary" disabled={battleId < 0 || joiningTeam || creatingTeam} size="large" className="uppercase flex-1" onClick={handleNewTeam}>
              {creatingTeam ? 'Creating team...' : 'Create new team'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );

  async function handleBattleId(newBattleId: number) {
    try {
      let battleInfo = await GameAPI.getBattleInfo(newBattleId);
      setBattleInfo(battleInfo);
      setBattleId(newBattleId);
    } catch (error) {
      toast.error(JSON.stringify(error));
    }
  }

  async function handleNewTeam() {
    if (isUndefined(currentWallet) || isUndefined(icpAgent)) {
      toast.error("Please connect your wallet");
      return;
    }
    if (isUndefined(gameInfo)) {
      toast.error("Service fee is not available");
      return;
    }
    if (battleInfo === null) {
      toast.error("Battle info is not available");
      return;
    }

    let nodeUrl = getStoragePanic(StorageKey.NODE_URL);
    let nodePublicKey = getStoragePanic(StorageKey.NODE_PUBLIC_KEY);
    let nodePrivateKey = getStoragePanic(StorageKey.NODE_PRIVATE_KEY);

    try {
      setCreatingTeam(true);
      let {
        invitationPayload,
        contextId,
        contextIdentity
      } = await GameAPI.createNewTeam(nodePublicKey);
      localStorage.setItem(StorageKey.CONTEXT_ID, contextId);
      localStorage.setItem(StorageKey.CONTEXT_IDENTITY, contextIdentity);
      await caliAdminService(nodeUrl).joinContext(contextId, nodePrivateKey, invitationPayload);
      toast.success(`Successfully created context ${contextId}`);

      let transferRes = await transfer(icpAgent, Principal.fromText(gameInfo.gameContract), battleInfo.deposit_price + battleInfo.service_fee);
      toast.info(`Transfer successful: ${JSON.stringify(transferRes)}`);
      await GameAPI.joinBattle(battleId, currentWallet.principal);

      setCreatingTeam(false);
      setOpen(false);
      router.push(`/games/sudoku/${battleId}`);

    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to join context ${contextId}:\nError${JSON.stringify(error.message)}`);
      } else {
        toast.error(`Failed to join context ${contextId}:\nError${JSON.stringify(error)}`);
      }
    }
    setCreatingTeam(false);
  }

  async function handleJoinTeam() {
    if (isUndefined(currentWallet) || isUndefined(icpAgent)) {
      toast.error("Please connect your wallet");
      return;
    }
    if (isUndefined(gameInfo)) {
      toast.error("Service fee is not available");
      return;
    }
    if (battleInfo === null) {
      toast.error("Battle info is not available");
      return;
    }

    let nodeUrl = getStoragePanic(StorageKey.NODE_URL);
    let nodePublicKey = getStoragePanic(StorageKey.NODE_PUBLIC_KEY);
    let nodePrivateKey = getStoragePanic(StorageKey.NODE_PRIVATE_KEY);

    try {
      setJoiningTeam(true);
      let { invitationPayload } = await GameAPI.inviteToTeam(nodePublicKey, contextId, contextIdentity);
      await caliAdminService(nodeUrl).joinContext(contextId, nodePrivateKey, invitationPayload);
      localStorage.setItem(StorageKey.CONTEXT_ID, contextId);
      localStorage.setItem(StorageKey.CONTEXT_IDENTITY, contextIdentity);
      toast.success(`Successfully joined context ${contextId}`);

      let transferRes = await transfer(icpAgent, Principal.fromText(gameInfo.gameContract), battleInfo.deposit_price + battleInfo.service_fee);
      toast.info(`Transfer successful: ${JSON.stringify(transferRes)}`);
      await GameAPI.joinBattle(battleId, currentWallet.principal);

      setJoiningTeam(false);
      setOpen(false);
      router.push(`/games/sudoku/${battleId}`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to join context ${contextId}:\nError${JSON.stringify(error.message)}`);
      } else {
        toast.error(`Failed to join context ${contextId}:\nError${JSON.stringify(error)}`);
      }
    }
    setJoiningTeam(false);
  }
}
