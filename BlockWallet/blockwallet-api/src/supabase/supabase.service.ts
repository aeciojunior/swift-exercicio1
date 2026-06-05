import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private adminClient: SupabaseClient;
  private supabaseUrl: string;
  private anonKey: string;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const url = this.config.get<string>('supabase.url');
    const serviceRoleKey = this.config.get<string>('supabase.serviceRoleKey');
    const anonKey = this.config.get<string>('supabase.anonKey');

    if (!url || !serviceRoleKey || !anonKey) {
      throw new Error(
        'SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY são obrigatórios.',
      );
    }

    this.supabaseUrl = url;
    this.anonKey = anonKey;

    this.adminClient = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  /** Client com service_role — ignora RLS. Usar apenas em operações internas (cron, triggers). */
  getAdminClient(): SupabaseClient {
    return this.adminClient;
  }

  /** Client com JWT do usuário — respeita RLS. Usar em todos os endpoints autenticados. */
  getClientWithToken(accessToken: string): SupabaseClient {
    return createClient(this.supabaseUrl, this.anonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
}
