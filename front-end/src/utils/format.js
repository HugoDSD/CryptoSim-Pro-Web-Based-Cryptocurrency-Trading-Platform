export const formatUSD = (value) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value) || 0);
export const formatPrice = (value) => {
    const n = Number(value) || 0;
    const digits = n < 1 ? 6 : 2;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: digits,
    }).format(n);
};
export const formatPercent = (value) => `${(Number(value) || 0).toFixed(2)} %`;
export const formatCompact = (value) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 2,
    }).format(Number(value) || 0);
export const formatQuantity = (value) => Number(Number(value).toFixed(8)).toString();
export const pnlColor = (value) =>
    Number(value) > 0 ? '#3f8600' : Number(value) < 0 ? '#cf1322' : 'rgba(0,0,0,0.65)';
export const CRYPTOS = [
    {
        id: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
    },
    {
        id: 'ethereum',
        symbol: 'ETH',
        name: 'Ethereum',
    },
    {
        id: 'solana',
        symbol: 'SOL',
        name: 'Solana',
    },
    {
        id: 'ripple',
        symbol: 'XRP',
        name: 'XRP',
    },
    {
        id: 'cardano',
        symbol: 'ADA',
        name: 'Cardano',
    },
    {
        id: 'dogecoin',
        symbol: 'DOGE',
        name: 'Dogecoin',
    },
    {
        id: 'polkadot',
        symbol: 'DOT',
        name: 'Polkadot',
    },
    {
        id: 'litecoin',
        symbol: 'LTC',
        name: 'Litecoin',
    },
    {
        id: 'chainlink',
        symbol: 'LINK',
        name: 'Chainlink',
    },
    {
        id: 'stellar',
        symbol: 'XLM',
        name: 'Stellar',
    },
];
export const cryptoLabel = (id) => {
    const c = CRYPTOS.find((x) => x.id === id);
    return c ? `${c.name} (${c.symbol})` : id;
};
