'use client';

import SearchBar from "@/components/common/SearchBar/SearchBar";
import BattleCard from "@/components/home/BattleCard";
import ArrowDownIcon from "@/components/common/icons/ArrowDownIcon";
import { GameInfo } from "@/types/game";
import { BattleInfo, BattleStatus } from "@/types/battle";
import { randInt } from "@/utils/math";
import { Button, Checkbox, Typography } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BattleIcon from "@/components/common/icons/BattleIcon";
import { ClientLogin, SetupModal } from "@calimero-network/calimero-client";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { getStorage, StorageKey } from "@/utils/storage";
import { getOrCreateKeypair } from "@/auth/ed25519";
import { CalimeroAdminAPI } from "@/api/calimero-admin/calimeroAdminAPI";
import { caliAdminService } from "@/api/calimero-admin";

const { Text } = Typography;

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
    maxPlayers: 4,
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
    maxPlayers: 4,
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
    maxPlayers: 4,
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
          {/* <SubmitNFTIcon /> */}
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

        <SearchBar placeholder="Search by battle ID, game, ..." className="w-full" />
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
