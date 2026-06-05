import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@Injectable()
export class PreferencesService {
  constructor(private readonly supabase: SupabaseService) {}

  async getPreferences(userId: string, token: string) {
    const client = this.supabase.getClientWithToken(token);
    const { data, error } = await client
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async upsertPreferences(
    userId: string,
    dto: UpdatePreferencesDto,
    token: string,
  ) {
    const client = this.supabase.getClientWithToken(token);

    const patch: Record<string, unknown> = { user_id: userId };
    if (dto.marketSortOrder !== undefined) patch.market_sort_order = dto.marketSortOrder;
    if (dto.chartPeriodDefault !== undefined) patch.chart_period_default = dto.chartPeriodDefault;
    if (dto.currencyDisplay !== undefined) patch.currency_display = dto.currencyDisplay;
    if (dto.theme !== undefined) patch.theme = dto.theme;
    if (dto.showPortfolioValue !== undefined) patch.show_portfolio_value = dto.showPortfolioValue;
    if (dto.priceChangeTimeframe !== undefined) patch.price_change_timeframe = dto.priceChangeTimeframe;
    if (dto.notificationsEnabled !== undefined) patch.notifications_enabled = dto.notificationsEnabled;

    const { data, error } = await client
      .from('user_preferences')
      .upsert(patch, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
