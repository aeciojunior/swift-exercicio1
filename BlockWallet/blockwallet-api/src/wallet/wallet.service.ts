import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { BuyDto, SellDto } from './dto/transaction.dto';

@Injectable()
export class WalletService {
  constructor(private readonly supabase: SupabaseService) {}

  async getWallet(userId: string, token: string) {
    const client = this.supabase.getClientWithToken(token);
    const { data, error } = await client
      .from('v_wallet_with_metadata')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async getWalletItem(userId: string, cryptoId: string, token: string) {
    const client = this.supabase.getClientWithToken(token);
    const { data, error } = await client
      .from('wallet_items')
      .select('*')
      .eq('user_id', userId)
      .eq('crypto_id', cryptoId)
      .single();

    if (error || !data) throw new NotFoundException('Ativo não encontrado na carteira.');
    return data;
  }

  async buy(userId: string, dto: BuyDto, token: string) {
    // Garantir que a moeda existe no cache antes de inserir na transação
    await this.ensureCoinExists(dto.cryptoId, token);

    const client = this.supabase.getClientWithToken(token);
    const { data, error } = await client
      .from('transactions')
      .insert({
        user_id: userId,
        crypto_id: dto.cryptoId,
        type: 'buy',
        quantity: dto.quantity,
        price_at_transaction: dto.priceAtTransaction,
        notes: dto.notes ?? null,
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes('Saldo insuficiente')) {
        throw new BadRequestException('Saldo insuficiente para realizar a compra.');
      }
      throw new Error(error.message);
    }
    return data;
  }

  async sell(userId: string, dto: SellDto, token: string) {
    const client = this.supabase.getClientWithToken(token);
    const { data, error } = await client
      .from('transactions')
      .insert({
        user_id: userId,
        crypto_id: dto.cryptoId,
        type: 'sell',
        quantity: dto.quantity,
        price_at_transaction: dto.priceAtTransaction,
        notes: dto.notes ?? null,
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes('Quantidade insuficiente')) {
        throw new BadRequestException('Quantidade insuficiente para realizar a venda.');
      }
      throw new Error(error.message);
    }
    return data;
  }

  private async ensureCoinExists(cryptoId: string, token: string): Promise<void> {
    const admin = this.supabase.getAdminClient();
    const { data } = await admin
      .from('coin_metadata')
      .select('coin_id')
      .eq('coin_id', cryptoId)
      .single();

    if (!data) {
      throw new BadRequestException(
        `Moeda '${cryptoId}' não encontrada no cache. Busque a moeda primeiro via GET /coins/${cryptoId}`,
      );
    }
  }
}
