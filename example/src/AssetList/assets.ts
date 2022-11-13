// this is from trust wallet assets
import tokenList from './tokenList.json';

export type AssetItemType = {
  id: string;
  name: string;
  balance: string;
  nativeBalance: string;
  symbol: string;
  network: 'ARBITRUM' | 'ERC20' | 'OPTIMISM' | 'POLYGON' | 'ETH';
  address?: string;
  icon?: string;
  change?: string;
};

function getRandomFloat(min: number, max: number, decimals: number) {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);

  return parseFloat(str);
}

function getChange() {
  return Math.random() > 0.5
    ? getRandomFloat(-100, 100, 2).toString()
    : undefined;
}

const balanceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});
const nativeBalanceFormatter = new Intl.NumberFormat('en-US');

const ethNativeBalance = getRandomFloat(0, 10000, 8);

const ethToken: AssetItemType = {
  id: 'asset-0',
  name: 'Etherium',
  nativeBalance: nativeBalanceFormatter.format(ethNativeBalance),
  balance: balanceFormatter.format(
    Math.floor(Math.random() * 100) * ethNativeBalance,
  ),
  symbol: 'ETH',
  network: 'ETH',
  change: getChange(),
};

const tokens: AssetItemType[] = tokenList
  .map((token, index) => {
    const nativeBalance = getRandomFloat(0, 100000, 8);
    const price = Math.floor(Math.random() * 100);
    const change = getChange();

    return {
      id: `asset-${index + 1}`,
      name: token.name,
      address: token.address,
      balance: balanceFormatter.format(nativeBalance * price),
      nativeBalance: nativeBalanceFormatter.format(nativeBalance),
      symbol: token.symbol,
      network: token.type as AssetItemType['network'],
      icon: token.logoURI,
      change,
    };
  })
  .sort((a, b) => parseFloat(a.balance) - parseFloat(b.balance));

export default [ethToken].concat(...tokens);
