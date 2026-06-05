import { Injectable } from '@nestjs/common';
import { CoingeckoService } from '../coingecko/coingecko.service';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class CoinsService {
  constructor(
    private readonly coingecko: CoingeckoService,
    private readonly supabase: SupabaseService,
  ) {}

  async getMarkets(
    page: number,
    perPage: number,
    order: string,
    vsCurrency: string,
  ) {
    return this.coingecko.getMarkets(vsCurrency, page, perPage, order);
  }

  async getCoinDetail(coinId: string) {
    // Busca da API e sincroniza no Supabase em background
    const detail = await this.coingecko.getCoinDetail(coinId);
    this.coingecko.syncCoinDetail(coinId).catch(() => null);
    return detail;
  }

  async getSimplePrice(ids: string, vsCurrencies = 'usd') {
    const coinIds = ids.split(',').map((s) => s.trim()).filter(Boolean);
    return this.coingecko.getSimplePrice(coinIds, vsCurrencies);
  }

  async getMarketChart(coinId: string, days: string, vsCurrency = 'usd') {
    return this.coingecko.getMarketChart(coinId, days, vsCurrency);
  }

  async search(query: string) {
    return this.coingecko.searchCoins(query);
  }

  /** Busca metadados em cache no Supabase (sem hit na CoinGecko). */
  async getCachedMetadata(coinId: string, token: string) {
    const client = this.supabase.getClientWithToken(token);
    const { data, error } = await client
      .from('coin_metadata')
      .select('*')
      .eq('coin_id', coinId)
      .single();

    if (error) return null;
    return data;
  }

  async listCachedMetadata(page: number, perPage: number, token: string) {
    const client = this.supabase.getClientWithToken(token);
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, error, count } = await client
      .from('coin_metadata')
      .select('*', { count: 'exact' })
      .order('market_cap_rank', { ascending: true, nullsFirst: false })
      .range(from, to);

    if (error) throw new Error(error.message);
    return { data, total: count, page, perPage };
  }
}
