export interface CoinMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  ath: number;
  atl: number;
}

export interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  market_cap_rank: number;
  market_data: {
    current_price: { usd: number };
    price_change_percentage_24h: number;
    market_cap: { usd: number };
    total_volume: { usd: number };
    ath: { usd: number };
    atl: { usd: number };
  };
  description: { en: string };
  links: { homepage: string[] };
  genesis_date: string | null;
}

export interface SimplePrice {
  [coinId: string]: {
    usd: number;
    usd_24h_change?: number;
  };
}

export interface MarketChart {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}
