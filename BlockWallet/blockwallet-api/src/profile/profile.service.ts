import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly supabase: SupabaseService) {}

  async getProfile(userId: string, token: string) {
    const client = this.supabase.getClientWithToken(token);
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) throw new NotFoundException('Perfil não encontrado.');
    return data;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto, token: string) {
    const client = this.supabase.getClientWithToken(token);
    const patch: Record<string, string> = {};
    if (dto.displayName) patch.display_name = dto.displayName;
    if (dto.avatarUrl) patch.avatar_url = dto.avatarUrl;

    const { data, error } = await client
      .from('profiles')
      .update(patch)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getDashboardSummary(userId: string, token: string) {
    const client = this.supabase.getClientWithToken(token);
    const { data, error } = await client.rpc('get_dashboard_summary', {
      p_user_id: userId,
    });

    if (error) throw new Error(error.message);
    return data?.[0] ?? null;
  }
}
