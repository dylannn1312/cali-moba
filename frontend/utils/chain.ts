export function shortAddress(address: string, length: number = 6) {
    return `${address.slice(0, length)}...${address.slice(-length)}`;
}
