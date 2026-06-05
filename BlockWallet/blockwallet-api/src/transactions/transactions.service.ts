import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class TransactionsService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(
    userId: string,
    token: string,
    cryptoId?: string,
    type?: string,
    page = 1,
    perPage = 20,
  ) {
    const client = this.supabase.getClientWithToken(token);
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = client
      .from('v_transactions_with_metadata')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (cryptoId) query = query.eq('crypto_id', cryptoId);
    if (type && (type === 'buy' || type === 'sell')) query = query.eq('type', type);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);
    return { data, total: count, page, perPage };
  }

  async findOne(userId: string, transactionId: string, token: string) {
    const client = this.supabase.getClientWithToken(token);
    const { data, error } = await client
      .from('v_transactions_with_metadata')
      .select('*')
      .eq('user_id', userId)
      .eq('id', transactionId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getSummary(userId: string, token: string) {
    const client = this.supabase.getClientWithToken(token);
    const { data, error } = await client
      .from('transactions')
      .select('type, total_value_usd')
      .eq('user_id', userId);

    if (error) throw new Error(error.message);

    const summary = (data ?? []).reduce(
      (acc, t) => {
        if (t.type === 'buy') acc.totalBoughtUsd += Number(t.total_value_usd);
        else acc.totalSoldUsd += Number(t.total_value_usd);
        acc.count++;
        return acc;
      },
      { totalBoughtUsd: 0, totalSoldUsd: 0, count: 0 },
    );

    return summary;
  }
}
