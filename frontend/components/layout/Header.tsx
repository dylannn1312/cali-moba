'use client';
import { Button, Input, Menu, MenuProps, Modal, Typography } from "antd";
import Link from "next/link";
import { HTMLProps, useRef, useState } from "react";
import { ConnectedWalletButton, ConnectWalletDropdownMenu, ConnectWalletButton, ConnectWallet } from "@nfid/identitykit/react"
import { MenuButtonProps } from "@headlessui/react";
import { shortAddress } from "@/utils/chain";
import { ClientLogin } from "@calimero-network/calimero-client";
import { getStorage, isInClient, StorageKey } from "@/utils/storage";
import { CLIENT_KEY } from "@/auth/storage";
import { getOrCreateKeypair } from "@/auth/ed25519";
import { toast } from "react-toastify";

const { Text, Title } = Typography;

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
        <Link href='/' className="mr-auto"><Text className='text-4xl pr-8 text-primary font-extrabold'>Cali MOBA</Text></Link>

        <Menu onClick={onClick} selectedKeys={[currentPage]} mode="horizontal" items={menuItems} className='border-b-transparent min-w-[200px]' />
        <SetupNode />
        <MyConnectWalletButton />
      </div>
    </header>
  )
}

function SetupNode() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} className="font-bold rounded-md py-5" type="primary">
        {isInClient() && getStorage(StorageKey.NODE_NAME) || 'Setup node'}
      </Button>
      <Modal
        open={open}
        destroyOnClose
        width={600}
        footer={[]}
        closeIcon={null}
        classNames={{
          content: '!p-0 !rounded-xl !bg-transparent',
        }}
      >
        <div className="flex flex-col gap-3 bg-light-secondary p-5 rounded-xl">
          <Title level={2} className="w-full text-center">Setup node</Title>
          <div className="flex flex-col">
            <Title level={5}>Your node name</Title>
            <Input
              placeholder="Enter your node name"
              className="h-[40px] w-full border-2"
              onChange={(e) => localStorage.setItem(StorageKey.NODE_NAME, e.target.value)}
              defaultValue={getStorage(StorageKey.NODE_NAME) || ''}
            />
          </div>
          <div className="flex flex-col">
            <Title level={5}>Your node URL</Title>
            <Input
              placeholder="Enter your node URL"
              className="h-[40px] w-full border-2"
              onChange={(e) => localStorage.setItem(StorageKey.NODE_URL, e.target.value)}
              defaultValue={getStorage(StorageKey.NODE_URL) || ''}
            />
          </div>
          <div className="flex flex-col">
            <Title level={5}>Your node public key</Title>
            <Input
              placeholder="Enter your node public key"
              className="h-[40px] w-full border-2"
              onChange={(e) => localStorage.setItem(StorageKey.NODE_PUBLIC_KEY, e.target.value)}
              defaultValue={getStorage(StorageKey.NODE_PUBLIC_KEY) || ''}
            />
          </div>
          <div className="flex flex-col">
            <Title level={5}>Your node private key</Title>
            <Input
              placeholder="Enter your node private key"
              className="h-[40px] w-full border-2"
              onChange={(e) => localStorage.setItem(StorageKey.NODE_PRIVATE_KEY, e.target.value)}
              defaultValue={getStorage(StorageKey.NODE_PRIVATE_KEY) || ''}
            />
          </div>
          <Button type="primary" onClick={() => setOpen(false)} className="w-full font-bold uppercase mt-5" size="large">Save</Button>
        </div>
      </Modal>
    </>
  )
}

function MyConnectWalletButton() {
  return (
    <ConnectWallet
      connectButtonComponent={ConnectButton}
      connectedButtonComponent={ConnectedButton}
      dropdownMenuComponent={ConnectWalletDropdownMenu}
    />
  )
}

function ConnectButton(props: HTMLProps<HTMLButtonElement> & {
  loading?: boolean;
}) {
  return (
    <Button className="font-bold rounded-md py-5" {...props} type="primary">
      Connect Wallet
    </Button>
  )
}

function ConnectedButton(props: MenuButtonProps & {
  connectedAccount: string;
  icpBalance?: number;
}) {
  getOrCreateKeypair().catch(toast.error);

  return (
    <ConnectedWalletButton {...props} className="font-bold !rounded-md py-5 !bg-button hover:!bg-button-hover">
      <img className="h-6 w-6 mr-2" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjcwMSIgaGVpZ2h0PSIzOTI1IiB2aWV3Qm94PSIwIDAgMjcwMSAzOTI1IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMCAxMTIzLjc4QzAgMTAzNi42NCA3MC42NDIgOTY2IDE1Ny43ODMgOTY2SDI1NDIuMjhDMjYyOS40MyA5NjYgMjcwMC4wNyAxMDM2LjY0IDI3MDAuMDcgMTEyMy43OFYxOTA5Ljc0QzI3MDAuMDcgMjY1NS4zNCAyMDk1LjY0IDMyNTkuNzggMTM1MC4wMyAzMjU5Ljc4QzYwNC40MzEgMzI1OS43OCAwIDI2NTUuMzQgMCAxOTA5Ljc0VjExMjMuNzhaIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXIpIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjU5My4xNyAyNDM3LjNDMjM4Ny43NyAyOTIwLjgzIDE5MDguNSAzMjU5Ljk0IDEzNTAuMDMgMzI1OS45NEM2MDQuNDMxIDMyNTkuOTQgMCAyNjU1LjUxIDAgMTkwOS45VjEzNDIuMTZDMjU2LjQxNiAxMjAwLjU4IDU1MS4yMjMgMTEyMCA4NjQuODUgMTEyMEMxNjkwLjE3IDExMjAgMjM4NS4xNyAxNjc3Ljk5IDI1OTMuMTcgMjQzNy4zWiIgZmlsbD0idXJsKCNwYWludDFfbGluZWFyKSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTIyNzAuMzggMjg5OC41MkMyMDI5LjI0IDMxMjMuMyAxNzA1LjcgMzI2MC44NCAxMzUwLjAzIDMyNjAuODRDNjA0LjQzMSAzMjYwLjg0IDAgMjY1Ni40MSAwIDE5MTAuOFYxNzY2LjQ4QzIyOC40OTUgMTYyMy41OSA0OTguNTY4IDE1NDEgNzg3LjkzMSAxNTQxQzE1NjUuNzkgMTU0MSAyMjA0LjI1IDIxMzcuODIgMjI3MC4zOCAyODk4LjUyWiIgZmlsbD0idXJsKCNwYWludDJfbGluZWFyKSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE4MDQuMyAzMTg4LjcxQzE3NzYuMjIgMjU2NS41NiAxMjY0IDIwNjkgNjM2LjIyMiAyMDY5QzQxOC4wMzIgMjA2OSAyMTMuNzk5IDIxMjguOTggMzkgMjIzMy40MkMxNDcuNjg4IDI2NzguNzMgNDc1LjM0NCAzMDM3Ljc2IDkwMC44OTQgMzE4OC45OFYzMjY0LjQ0QzkwMC44OTQgMzM3My42OSA5NTkuNTkgMzQ2OS4xOCAxMDQ3LjA2IDM1MjAuODhWMzcyNi4zN0MxMDQ3LjA2IDM4MzUuODYgMTEzNS40OSAzOTI0LjYxIDEyNDQuNTcgMzkyNC42MUgxNDU5Ljg2QzE1NjguOTUgMzkyNC42MSAxNjU3LjM4IDM4MzUuODYgMTY1Ny4zOCAzNzI2LjM3VjM1MjAuODhDMTc0NC44NSAzNDY5LjE4IDE4MDMuNTQgMzM3My42OSAxODAzLjU0IDMyNjQuNDRWMzE4OC45OEMxODAzLjggMzE4OC44OSAxODA0LjA1IDMxODguOCAxODA0LjMgMzE4OC43MVoiIGZpbGw9InVybCgjcGFpbnQzX2xpbmVhcikiLz4KPHBhdGggZD0iTTUwNCA2MEM1MDQgMjYuODYyOSA1MzAuODYzIDAgNTY0IDBIODM4Qzg3MS4xMzcgMCA4OTggMjYuODYyOSA4OTggNjBWOTY2SDUwNFY2MFoiIGZpbGw9IiMwMzE1MTQiLz4KPHBhdGggZD0iTTE3OTIgNjBDMTc5MiAyNi44NjI5IDE4MTguODYgMCAxODUyIDBIMjEyNkMyMTU5LjE0IDAgMjE4NiAyNi44NjI5IDIxODYgNjBWOTY2SDE3OTJWNjBaIiBmaWxsPSIjMDMxNTE0Ii8+CjxnIGZpbHRlcj0idXJsKCNmaWx0ZXIwX2kpIj4KPHBhdGggZD0iTTY3Mi4xMzMgMjMzOS42QzY2NS43OTYgMjMzOC4zNiA2NTkuOTYgMjM0My4zOSA2NjAuMzY1IDIzNDkuODRDNjgwLjQyOCAyNjY5LjMxIDk4MS45ODcgMjkyMi45MyAxMzUxLjA1IDI5MjIuOTNDMTcxOS4yNyAyOTIyLjkzIDIwMjAuMjkgMjY3MC40OCAyMDQxLjYgMjM1Mi4wNUMyMDQyLjAzIDIzNDUuNiAyMDM2LjIxIDIzNDAuNTQgMjAyOS44NyAyMzQxLjc2QzE4MTUuMDkgMjM4My4xMiAxNTg0IDI0MjMuNDIgMTM1MS4wNSAyNDIzLjQyQzExMTQuMDIgMjQyMy40MiA4ODkuODcgMjM4Mi4zNCA2NzIuMTMzIDIzMzkuNloiIGZpbGw9InVybCgjcGFpbnQ0X2xpbmVhcikiLz4KPC9nPgo8cGF0aCBkPSJNNzAzLjEwOSAyMzkwLjQyQzcxNC45OTEgMjQ5MC43OSAxMDA3LjQyIDI2MTMuMjkgMTM1NS40OSAyNjEzLjI5QzE3MDIuNzcgMjYxMy4yOSAxOTg5Ljc4IDI0OTAuNDggMjAwMi44NSAyMzkwLjQyQzE3OTkuNjggMjQwMy40MyAxNzgyLjk0IDI0NjguMTQgMTM1NS40OSAyNDY4LjE0QzkwNi4yNTUgMjQ2OC4xNCA5MDkuNDA2IDI0MDMuODYgNzAzLjEwOSAyMzkwLjQyWiIgZmlsbD0idXJsKCNwYWludDVfbGluZWFyKSIvPgo8cGF0aCBkPSJNMTI5OSAxNzM0Ljk1QzExOTcuNDMgMTkyMS40MSAxMDM4LjY2IDIxMDkuODQgODU1LjIzNCAyMTA0LjkxQzY2Ny44OCAyMTA0LjkxIDUxNiAxOTM5LjI3IDUxNiAxNzM0Ljk1QzUxNiAxNTMwLjYzIDY2Ny44OCAxMzY1IDg1NS4yMzQgMTM2NUMxMDQyLjU5IDEzNjUgMTE4MC42NiAxNTI4Ljc3IDEyOTkgMTczNC45NVoiIGZpbGw9InVybCgjcGFpbnQ2X2xpbmVhcikiLz4KPHBhdGggZD0iTTEzOTkgMTczNS40OUMxNTAwLjU3IDE5MTguMjQgMTY1OS4zNCAyMTA5Ljc1IDE4NDIuNzcgMjEwNC45MUMyMDMwLjEyIDIxMDQuOTEgMjE4MiAxOTM1Ljc1IDIxODIgMTczNS40OUMyMTgyIDE1MzUuMjMgMjAzMS4xMSAxMzY1IDE4NDMuNzUgMTM2NUMxNjU2LjQgMTM2NSAxNTE3LjM0IDE1MzMuNCAxMzk5IDE3MzUuNDlaIiBmaWxsPSJ1cmwoI3BhaW50N19saW5lYXIpIi8+CjxjaXJjbGUgY3g9Ijk4Ny41NDIiIGN5PSIxNzk3LjE4IiByPSI4OS4xNzQzIiBmaWxsPSIjMDMxNTE0Ii8+CjxjaXJjbGUgY3g9IjEwMTguNyIgY3k9IjE4MzYuOTQiIHI9IjMwLjA4MjkiIGZpbGw9IndoaXRlIi8+CjxjaXJjbGUgY3g9IjE3MTEuMzciIGN5PSIxNzk3LjE4IiByPSI4OS4xNzQzIiBmaWxsPSIjMDMxNTE0Ii8+CjxjaXJjbGUgY3g9IjE3NDIuNTMiIGN5PSIxODM2Ljk0IiByPSIzMC4wODI5IiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTMwMC44NyAxNzM4LjU4TDUxNy45NzIgMTc3OUM1MTYuMjgzIDE3NjQuMjEgNTE1LjAyMSAxNzU3LjMxIDUxNS4wMTkgMTc0Ni40N0M1MTMuMDQ3IDE1MjguNjEgNjY1Ljg4MyAxMzYzIDg1OC4xNTUgMTM2M0MxMDUwLjQzIDEzNjMgMTIwMC4yOSAxNTUzLjI2IDEyOTguOSAxNzMzLjY1QzEyOTguMDcgMTczNS4xNyAxMzAxLjcxIDE3MzcuMDYgMTMwMC44NyAxNzM4LjU4WiIgZmlsbD0iIzAzMTUxNCIvPgo8cGF0aCBkPSJNMTM5Ny4xMyAxNzM4LjU4TDIxODAuODMgMTc3OUMyMTgyLjUyIDE3NjQuMjEgMjE4Mi43OCAxNzU3LjMxIDIxODIuNzggMTc0Ni40N0MyMTg5LjcxIDE1MzIuNTUgMjAzMS45NSAxMzYzIDE4MzkuNzMgMTM2M0MxNjQ3LjUxIDEzNjMgMTQ5Ny42OCAxNTUzLjI2IDEzOTkuMSAxNzMzLjY1QzEzOTkuOTMgMTczNS4xNyAxMzk2LjI5IDE3MzcuMDYgMTM5Ny4xMyAxNzM4LjU4WiIgZmlsbD0iIzAzMTUxNCIvPgo8ZyBmaWx0ZXI9InVybCgjZmlsdGVyMV9pKSI+CjxwYXRoIGQ9Ik0xODM4LjE3IDEyNzJDMTU5OS40OSAxMjcyIDE0MjUuNzYgMTUxMC4zMyAxMzUwIDE2MzcuNTJDMTI3NC4yNCAxNTEwLjMzIDExMDAuNTEgMTI3MiA4NjEuODMxIDEyNzJDNjIwLjkyNyAxMjcyIDQyNSAxNDc5LjQ5IDQyNSAxNzM0LjVDNDI1IDE5ODkuNTEgNjIwLjkyNyAyMTk3IDg2MS44MzEgMjE5N0MxMTAwLjQ4IDIxOTcgMTI3NC4yNCAxOTU4LjY3IDEzNTAgMTgzMS40NUMxNDI1Ljc2IDE5NTguNjcgMTU5OS40OSAyMTk3IDE4MzguMTcgMjE5N0MyMDc5LjA3IDIxOTcgMjI3NSAxOTg5LjUxIDIyNzUgMTczNC41QzIyNzUgMTQ3OS40OSAyMDc5LjA3IDEyNzIgMTgzOC4xNyAxMjcyWk04NjEuODMxIDIxMDQuNUM2NzEuOTc1IDIxMDQuNSA1MTcuNSAxOTM4LjUyIDUxNy41IDE3MzQuNUM1MTcuNSAxNTMwLjQ4IDY3MS45NzUgMTM2NC41IDg2MS44MzEgMTM2NC41QzEwODcuMzkgMTM2NC41IDEyNTYuMzEgMTY1NS4zMyAxMjk4LjE0IDE3MzQuNUMxMjU2LjMxIDE4MTMuNjcgMTA4Ny40MiAyMTA0LjUgODYxLjgzMSAyMTA0LjVaTTE4MzguMTcgMjEwNC41QzE2MTIuNjEgMjEwNC41IDE0NDMuNjkgMTgxMy42NyAxNDAxLjg2IDE3MzQuNUMxNDQzLjY5IDE2NTUuMzMgMTYxMi42MSAxMzY0LjUgMTgzOC4xNyAxMzY0LjVDMjAyOC4wMyAxMzY0LjUgMjE4Mi41IDE1MzAuNDggMjE4Mi41IDE3MzQuNUMyMTgyLjUgMTkzOC41MiAyMDI4LjAzIDIxMDQuNSAxODM4LjE3IDIxMDQuNVoiIGZpbGw9InVybCgjcGFpbnQ4X2xpbmVhcikiLz4KPC9nPgo8ZGVmcz4KPGZpbHRlciBpZD0iZmlsdGVyMF9pIiB4PSI2NjAuMzQ1IiB5PSIyMzM5LjQxIiB3aWR0aD0iMTM4MS4yNyIgaGVpZ2h0PSI1ODMuNTIxIiBmaWx0ZXJVbml0cz0idXNlclNwYWNlT25Vc2UiIGNvbG9yLWludGVycG9sYXRpb24tZmlsdGVycz0ic1JHQiI+CjxmZUZsb29kIGZsb29kLW9wYWNpdHk9IjAiIHJlc3VsdD0iQmFja2dyb3VuZEltYWdlRml4Ii8+CjxmZUJsZW5kIG1vZGU9Im5vcm1hbCIgaW49IlNvdXJjZUdyYXBoaWMiIGluMj0iQmFja2dyb3VuZEltYWdlRml4IiByZXN1bHQ9InNoYXBlIi8+CjxmZUNvbG9yTWF0cml4IGluPSJTb3VyY2VBbHBoYSIgdHlwZT0ibWF0cml4IiB2YWx1ZXM9IjAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDEyNyAwIiByZXN1bHQ9ImhhcmRBbHBoYSIvPgo8ZmVPZmZzZXQvPgo8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIxNy41Ii8+CjxmZUNvbXBvc2l0ZSBpbjI9ImhhcmRBbHBoYSIgb3BlcmF0b3I9ImFyaXRobWV0aWMiIGsyPSItMSIgazM9IjEiLz4KPGZlQ29sb3JNYXRyaXggdHlwZT0ibWF0cml4IiB2YWx1ZXM9IjAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAuNjQgMCIvPgo8ZmVCbGVuZCBtb2RlPSJub3JtYWwiIGluMj0ic2hhcGUiIHJlc3VsdD0iZWZmZWN0MV9pbm5lclNoYWRvdyIvPgo8L2ZpbHRlcj4KPGZpbHRlciBpZD0iZmlsdGVyMV9pIiB4PSI0MjUiIHk9IjEyNzIiIHdpZHRoPSIxODUwIiBoZWlnaHQ9IjkyNSIgZmlsdGVyVW5pdHM9InVzZXJTcGFjZU9uVXNlIiBjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnM9InNSR0IiPgo8ZmVGbG9vZCBmbG9vZC1vcGFjaXR5PSIwIiByZXN1bHQ9IkJhY2tncm91bmRJbWFnZUZpeCIvPgo8ZmVCbGVuZCBtb2RlPSJub3JtYWwiIGluPSJTb3VyY2VHcmFwaGljIiBpbjI9IkJhY2tncm91bmRJbWFnZUZpeCIgcmVzdWx0PSJzaGFwZSIvPgo8ZmVDb2xvck1hdHJpeCBpbj0iU291cmNlQWxwaGEiIHR5cGU9Im1hdHJpeCIgdmFsdWVzPSIwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAxMjcgMCIgcmVzdWx0PSJoYXJkQWxwaGEiLz4KPGZlT2Zmc2V0Lz4KPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMTcuNSIvPgo8ZmVDb21wb3NpdGUgaW4yPSJoYXJkQWxwaGEiIG9wZXJhdG9yPSJhcml0aG1ldGljIiBrMj0iLTEiIGszPSIxIi8+CjxmZUNvbG9yTWF0cml4IHR5cGU9Im1hdHJpeCIgdmFsdWVzPSIwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwLjY0IDAiLz4KPGZlQmxlbmQgbW9kZT0ibm9ybWFsIiBpbjI9InNoYXBlIiByZXN1bHQ9ImVmZmVjdDFfaW5uZXJTaGFkb3ciLz4KPC9maWx0ZXI+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhciIgeDE9IjE4MDEuNjkiIHkxPSIxODE2LjA2IiB4Mj0iMjc3My4wNCIgeTI9Ijg0My43MTgiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzQ2RkY0NyIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM5Q0ZGOUQiLz4KPC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDFfbGluZWFyIiB4MT0iMTU2Ni45OSIgeTE9IjE3OTUuODEiIHgyPSIxODk2Ljc4IiB5Mj0iMTIyMy45IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiMxMEQ5RUQiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMTBEOUVEIiBzdG9wLW9wYWNpdHk9IjAuMyIvPgo8L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50Ml9saW5lYXIiIHgxPSIxNDYwLjQ4IiB5MT0iMjAzOS41MiIgeDI9IjE2NDkuNzYiIHkyPSIxNTM1LjkxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNGQTUxRDMiLz4KPHN0b3Agb2Zmc2V0PSIwLjk1ODc3NCIgc3RvcC1jb2xvcj0iI0ZBNTFEMyIgc3RvcC1vcGFjaXR5PSIwIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQzX2xpbmVhciIgeDE9IjEwMDIuNSIgeTE9IjI4MjMiIHgyPSIxMzA2LjU0IiB5Mj0iMjAxMy4yNiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjRkZFNzAwIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0ZGRTcwMCIgc3RvcC1vcGFjaXR5PSIwIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQ0X2xpbmVhciIgeDE9IjEzNTEuMDEiIHkxPSIyMzM3LjE2IiB4Mj0iMTM1MS4wMSIgeTI9IjI5MjIuOTMiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3AvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3Atb3BhY2l0eT0iMC42NSIvPgo8L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50NV9saW5lYXIiIHgxPSIxNTQwLjM1IiB5MT0iMjQyMS45NyIgeDI9IjE1NDAuMzUiIHkyPSIyNTc5Ljc2IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIG9mZnNldD0iMC43NSIgc3RvcC1jb2xvcj0id2hpdGUiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjREVERURGIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQ2X2xpbmVhciIgeDE9IjEwMjAuMzgiIHkxPSIxNDY5Ljc4IiB4Mj0iMTAyMC4zNyIgeTI9IjE5OTMuNjciIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agb2Zmc2V0PSIwLjc1IiBzdG9wLWNvbG9yPSJ3aGl0ZSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNERURFREYiLz4KPC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDdfbGluZWFyIiB4MT0iMTY3Ny42MiIgeTE9IjE0NjkuNzgiIHgyPSIxNjc3LjYzIiB5Mj0iMTk5My42NyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBvZmZzZXQ9IjAuNzUiIHN0b3AtY29sb3I9IndoaXRlIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0RFREVERiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50OF9saW5lYXIiIHgxPSIxMzUwIiB5MT0iMTI3MiIgeDI9IjEzNTAiIHkyPSIyMTk3IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAuNjUiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4=" alt="Plug"></img>
      <Text className="text-text">{shortAddress(props.connectedAccount)} - <Text className="text-primary">{props.icpBalance} ICP</Text></Text>
    </ConnectedWalletButton>
  )
}
