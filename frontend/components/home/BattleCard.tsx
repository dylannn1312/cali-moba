'use client';
import { BattleInfo, BattleStatus, battleStatusColor } from "@/types/battle";
import { Button, Typography } from "antd";
import Link from "next/link";
import PeopleIcon from "../common/icons/PeopleIcon";
import GameStatusTag from "../common/BattleStatusTag";
import HiddenCopyableText from "../common/HiddenCopyableText";
import { shortAddress } from "@/utils/chain";

const { Title, Text } = Typography;

export default function BattleCard({
    idByGame,
    creator,
    status,
    playerCount,
    gameInfo,
    depositPrice
}: BattleInfo) {
    return (
        <div className="cursor-pointer rounded-xl shadow-lg flex flex-col pb-4 gap-4 bg-light-secondary">
            <div className="h-[250px] relative overflow-hidden rounded-t-xl border-b border-button">
                <img
                    src={gameInfo.splashImg}
                    alt={gameInfo.name}
                    className="absolute w-full h-full object-cover hover:scale-110 transform transition-transform duration-300 bg-red-600"
                />
            </div>
            <div className="flex flex-col px-3 text-sm text-muted gap-2">
                <div className="flex text-text">
                    <Text strong className="text-xl flex-1">{`${gameInfo.name} #${idByGame}`}</Text>
                    <GameStatusTag status={status} />
                </div>
                <div className="flex gap-2 items-center">
                    <PeopleIcon color={battleStatusColor[status]} size={16} />
                    <Text style={{color: battleStatusColor[status]}}>{playerCount} <Text className="text-muted"></Text></Text>
                </div>
                <HiddenCopyableText textToCopy={creator}>
                    <div className="text-muted">
                        <strong>Creator: </strong>
                        {shortAddress(creator, 11)}
                    </div>
                </HiddenCopyableText>
                <Text><strong>Deposit: </strong><span className="uppercase">{depositPrice} {process.env.TOKEN}</span></Text>
                <Text><strong>Pool: </strong><span className="uppercase">{depositPrice * playerCount} {process.env.TOKEN}</span></Text>
            </div>
            <Button type="primary" className="rounded-lg mx-3 py-5">
                <Text strong className="uppercase">
                    {status == BattleStatus.Pending ? "Join" : (status == BattleStatus.Playing ? "Watch" : "Enter")}
                </Text>
            </Button>
        </div>
    )
}
