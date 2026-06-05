import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AddFavoriteDto } from './dto/add-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(userId: string, token: string) {
    const client = this.supabase.getClientWithToken(token);
    const { data, error } = await client
      .from('v_favorites_with_metadata')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async add(userId: string, dto: AddFavoriteDto, token: string) {
    const client = this.supabase.getClientWithToken(token);
    const { data, error } = await client
      .from('favorites')
      .insert({ user_id: userId, crypto_id: dto.cryptoId })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new ConflictException('Moeda já está nos favoritos.');
      }
      throw new Error(error.message);
    }
    return data;
  }

  async remove(userId: string, cryptoId: string, token: string) {
    const client = this.supabase.getClientWithToken(token);
    const { error, count } = await client
      .from('favorites')
      .delete({ count: 'exact' })
      .eq('user_id', userId)
      .eq('crypto_id', cryptoId);

    if (error) throw new Error(error.message);
    if (!count) throw new NotFoundException('Favorito não encontrado.');
    return { message: 'Removido dos favoritos.' };
  }

  async isFavorite(userId: string, cryptoId: string, token: string) {
    const client = this.supabase.getClientWithToken(token);
    const { data } = await client
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('crypto_id', cryptoId)
      .single();

    return { isFavorite: !!data };
  }
}
