import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateSnapshotDto } from './dto/create-snapshot.dto';

@Injectable()
export class PortfolioService {
  constructor(private readonly supabase: SupabaseService) {}

  async getSnapshots(
    userId: string,
    token: string,
    days = 30,
  ) {
    const client = this.supabase.getClientWithToken(token);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await client
      .from('portfolio_snapshots')
      .select('*')
      .eq('user_id', userId)
      .gte('snapshot_date', since.toISOString().split('T')[0])
      .order('snapshot_date', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  }

  async upsertSnapshot(userId: string, dto: CreateSnapshotDto, token: string) {
    const client = this.supabase.getClientWithToken(token);
    const snapshotDate = dto.snapshotDate ?? new Date().toISOString().split('T')[0];

    const { data, error } = await client
      .from('portfolio_snapshots')
      .upsert(
        {
          user_id: userId,
          snapshot_date: snapshotDate,
          total_value_usd: dto.totalValueUsd,
          available_balance_usd: dto.availableBalanceUsd,
          asset_count: dto.assetCount,
        },
        { onConflict: 'user_id,snapshot_date' },
      )
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getLatestSnapshot(userId: string, token: string) {
    const client = this.supabase.getClientWithToken(token);
    const { data, error } = await client
      .from('portfolio_snapshots')
      .select('*')
      .eq('user_id', userId)
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single();

    if (error) return null;
    return data;
  }
}
