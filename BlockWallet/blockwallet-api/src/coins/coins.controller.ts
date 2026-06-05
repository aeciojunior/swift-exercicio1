import { Controller, Get, Param, Query } from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import {
  AccessToken,
  CurrentUser,
} from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CoinsService } from './coins.service';

@Controller('coins')
export class CoinsController {
  constructor(private readonly coinsService: CoinsService) {}

  /** Lista de moedas ao vivo da CoinGecko (market list do app). */
  @Public()
  @Get('markets')
  getMarkets(
    @Query('page') page = '1',
    @Query('per_page') perPage = '50',
    @Query('order') order = 'market_cap_desc',
    @Query('vs_currency') vsCurrency = 'usd',
  ) {
    return this.coinsService.getMarkets(+page, +perPage, order, vsCurrency);
  }

  /** Detalhe completo de uma moeda (tela de detalhe). */
  @Public()
  @Get(':id')
  getCoinDetail(@Param('id') id: string) {
    return this.coinsService.getCoinDetail(id);
  }

  /** Preço atual de uma ou mais moedas (ids separados por vírgula). */
  @Public()
  @Get('price/simple')
  getSimplePrice(
    @Query('ids') ids: string,
    @Query('vs_currencies') vsCurrencies = 'usd',
  ) {
    return this.coinsService.getSimplePrice(ids, vsCurrencies);
  }

  /** Dados de gráfico histórico. */
  @Public()
  @Get(':id/chart')
  getMarketChart(
    @Param('id') id: string,
    @Query('days') days = '7',
    @Query('vs_currency') vsCurrency = 'usd',
  ) {
    return this.coinsService.getMarketChart(id, days, vsCurrency);
  }

  /** Busca de moedas por nome/símbolo. */
  @Public()
  @Get('search/query')
  search(@Query('q') query: string) {
    return this.coinsService.search(query);
  }

  /** Metadados em cache no Supabase (sem hit na CoinGecko). */
  @Get('cache/list')
  listCached(
    @CurrentUser() _user: User,
    @AccessToken() token: string,
    @Query('page') page = '1',
    @Query('per_page') perPage = '50',
  ) {
    return this.coinsService.listCachedMetadata(+page, +perPage, token);
  }

  @Get('cache/:id')
  getCached(
    @Param('id') id: string,
    @CurrentUser() _user: User,
    @AccessToken() token: string,
  ) {
    return this.coinsService.getCachedMetadata(id, token);
  }
}
