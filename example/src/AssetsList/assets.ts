// this is from trust wallet assets
import tokenList from './tokenList.json';

type Asset = {
  name: string;
  balance: string;
  nativeBalance: string;
  symbol: string;
  network: 'ARBITRUM' | 'ERC20' | 'OPTIMISM' | 'POLYGON' | 'ETH';
  address?: string;
  icon?: string;
};

const ethNativeBalance = Math.floor(Math.random() * 1000);

const ethToken: Asset = {
  name: 'Etherium',
  nativeBalance: ethNativeBalance.toString(),
  balance: (Math.floor(Math.random() * 100) * ethNativeBalance).toString(),
  symbol: 'ETH',
  network: 'ETH',
};

const tokens: Asset[] = tokenList
  .map((token) => {
    const nativeBalance = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 100);

    return {
      name: token.name,
      address: token.address,
      balance: (nativeBalance * price).toString(),
      nativeBalance: nativeBalance.toString(),
      symbol: token.symbol,
      network: token.type as Asset['network'],
      icon: token.logoURI,
    };
  })
  .sort((a, b) => parseFloat(a.balance) - parseFloat(b.balance));

export default [ethToken].concat(...tokens);
