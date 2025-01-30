'use client';
import { Menu, MenuProps, Typography } from "antd";
import Link from "next/link";
import { useState } from "react";
import { ConnectWallet, ConnectedWalletButton, ConnectWalletDropdownMenu, ConnectWalletButton } from "@nfid/identitykit/react"

const { Text } = Typography;

type MenuItem = Required<MenuProps>['items'][number];

const menuItems: MenuItem[] = [
  {
    label: <Link href={'/'} className='hover:!text-muted font-bold text-base'>GAMES</Link>,
    key: 'top-games',

  },
  {
    label: <Link href={'/'} className='hover:!text-muted font-bold text-base'>WINNERS</Link>,
    key: 'winners',
  }
];

export default function Header() {
  const [currentPage, setCurrentPage] = useState('');

  const onClick: MenuProps['onClick'] = (e) => {
    setCurrentPage(e.key);
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md border-b border-gray-400">
      <div className="flex gap-8 items-center h-20 py-5 w-full">
        <Link href='/' className="mr-auto"><Text className='text-4xl pr-8 text-primary font-extrabold'>ZKGameboard</Text></Link>

        <Menu onClick={onClick} selectedKeys={[currentPage]} mode="horizontal" items={menuItems} className='border-b-transparent min-w-[200px]' />
        <MyConnectWalletButton />
      </div>
    </header>
  )
}

function MyConnectWalletButton() {
  return (
    <ConnectWallet
      connectButtonComponent={ConnectWalletButton}
      connectedButtonComponent={ConnectedWalletButton}
      dropdownMenuComponent={ConnectWalletDropdownMenu}
    />
  )
}
