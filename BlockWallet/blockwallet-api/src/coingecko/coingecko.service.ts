import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios, { AxiosInstance } from 'axios';
import { SupabaseService } from '../supabase/supabase.service';
import {
  CoinDetail,
  CoinMarket,
  MarketChart,
  SimplePrice,
} from './coingecko.types';

@Injectable()
export class CoingeckoService {
  private readonly logger = new Logger(CoingeckoService.name);
  private readonly http: AxiosInstance;
  private readonly syncTopN: number;

  constructor(
    private readonly config: ConfigService,
    private readonly supabase: SupabaseService,
  ) {
    const baseUrl = this.config.get<string>('coingecko.baseUrl');
    const apiKey = this.config.get<string>('coingecko.apiKey');
    this.syncTopN = this.config.get<number>('coingecko.syncTopN') ?? 100;

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (apiKey) headers['x-cg-demo-api-key'] = apiKey;

    this.http = axios.create({ baseURL: baseUrl, headers, timeout: 15000 });
  }

  // ── Endpoints públicos (passados para o app) ────────────────────────────────

  async getMarkets(
    vsCurrency = 'usd',
    page = 1,
    perPage = 50,
    order = 'market_cap_desc',
  ): Promise<CoinMarket[]> {
    const { data } = await this.http.get<CoinMarket[]>('/coins/markets', {
      params: {
        vs_currency: vsCurrency,
        order,
        per_page: perPage,
        page,
        sparkline: false,
        price_change_percentage: '24h',
      },
    });
    return data;
  }

  async getCoinDetail(coinId: string): Promise<CoinDetail> {
    const { data } = await this.http.get<CoinDetail>(`/coins/${coinId}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
      },
    });
    return data;
  }

  async getSimplePrice(
    coinIds: string[],
    vsCurrencies = 'usd',
    include24hChange = true,
  ): Promise<SimplePrice> {
    const { data } = await this.http.get<SimplePrice>('/simple/price', {
      params: {
        ids: coinIds.join(','),
        vs_currencies: vsCurrencies,
        include_24hr_change: include24hChange,
      },
    });
    return data;
  }

  async getMarketChart(
    coinId: string,
    days: string,
    vsCurrency = 'usd',
  ): Promise<MarketChart> {
    const { data } = await this.http.get<MarketChart>(
      `/coins/${coinId}/market_chart`,
      { params: { vs_currency: vsCurrency, days, interval: days === '1' ? 'hourly' : 'daily' } },
    );
    return data;
  }

  async searchCoins(query: string): Promise<{ coins: { id: string; name: string; symbol: string; thumb: string }[] }> {
    const { data } = await this.http.get('/search', { params: { query } });
    return data;
  }

  // ── Cron: sincronizar top N moedas no Supabase ──────────────────────────────

  /** Executa diariamente às 06:00 UTC para manter coin_metadata atualizado. */
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async syncTopCoins(): Promise<void> {
    this.logger.log(`Iniciando sync das top ${this.syncTopN} moedas...`);

    try {
      const pages = Math.ceil(this.syncTopN / 250);
      const allCoins: CoinMarket[] = [];

      for (let page = 1; page <= pages; page++) {
        const perPage = Math.min(250, this.syncTopN - allCoins.length);
        const coins = await this.getMarkets('usd', page, perPage);
        allCoins.push(...coins);
        if (coins.length < perPage) break;
      }

      const admin = this.supabase.getAdminClient();

      for (const coin of allCoins) {
        await admin.rpc('upsert_coin_metadata', {
          p_coin_id: coin.id,
          p_symbol: coin.symbol,
          p_name: coin.name,
          p_image_small: coin.image,
          p_market_cap_rank: coin.market_cap_rank,
          p_current_price_usd: coin.current_price,
          p_price_change_24h: coin.price_change_percentage_24h,
          p_market_cap_usd: coin.market_cap,
          p_total_volume_usd: coin.total_volume,
          p_ath_usd: coin.ath,
          p_atl_usd: coin.atl,
        });
      }

      this.logger.log(`Sync concluído: ${allCoins.length} moedas atualizadas.`);
    } catch (err) {
      this.logger.error('Falha no sync de moedas:', err);
    }
  }

  /** Enriquecer uma moeda com detalhes completos (imagens, descrição, homepage). */
  async syncCoinDetail(coinId: string): Promise<void> {
    try {
      const detail = await this.getCoinDetail(coinId);
      const admin = this.supabase.getAdminClient();

      await admin.rpc('upsert_coin_metadata', {
        p_coin_id: detail.id,
        p_symbol: detail.symbol,
        p_name: detail.name,
        p_image_thumb: detail.image.thumb,
        p_image_small: detail.image.small,
        p_image_large: detail.image.large,
        p_market_cap_rank: detail.market_cap_rank,
        p_current_price_usd: detail.market_data?.current_price?.usd,
        p_price_change_24h: detail.market_data?.price_change_percentage_24h,
        p_market_cap_usd: detail.market_data?.market_cap?.usd,
        p_total_volume_usd: detail.market_data?.total_volume?.usd,
        p_ath_usd: detail.market_data?.ath?.usd,
        p_atl_usd: detail.market_data?.atl?.usd,
        p_description_en: detail.description?.en?.replace(/<[^>]*>/g, '').slice(0, 2000),
        p_homepage_url: detail.links?.homepage?.[0] ?? null,
        p_genesis_date: detail.genesis_date ?? null,
      });
    } catch (err) {
      this.logger.warn(`Falha ao sincronizar detalhe de ${coinId}:`, err);
    }
  }
}
