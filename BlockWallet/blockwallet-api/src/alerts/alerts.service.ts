import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CoingeckoService } from '../coingecko/coingecko.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAlertDto } from './dto/create-alert.dto';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly coingecko: CoingeckoService,
  ) {}

  async findAll(userId: string, token: string, onlyActive = false) {
    const client = this.supabase.getClientWithToken(token);
    let query = client.from('price_alerts').select('*').eq('user_id', userId);
    if (onlyActive) query = query.eq('is_active', true);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  }

  async create(userId: string, dto: CreateAlertDto, token: string) {
    const client = this.supabase.getClientWithToken(token);
    const { data, error } = await client
      .from('price_alerts')
      .insert({
        user_id: userId,
        crypto_id: dto.cryptoId,
        alert_type: dto.alertType,
        target_price: dto.targetPrice,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deactivate(userId: string, alertId: string, token: string) {
    const client = this.supabase.getClientWithToken(token);
    const { data, error } = await client
      .from('price_alerts')
      .update({ is_active: false })
      .eq('id', alertId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) throw new NotFoundException('Alerta não encontrado.');
    return data;
  }

  async remove(userId: string, alertId: string, token: string) {
    const client = this.supabase.getClientWithToken(token);
    const { error, count } = await client
      .from('price_alerts')
      .delete({ count: 'exact' })
      .eq('id', alertId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    if (!count) throw new NotFoundException('Alerta não encontrado.');
    return { message: 'Alerta removido.' };
  }

  /** Cron a cada 5 minutos: verifica alertas ativos e dispara os que foram atingidos. */
  @Cron('*/5 * * * *')
  async checkAlerts(): Promise<void> {
    const admin = this.supabase.getAdminClient();

    const { data: alerts } = await admin
      .from('price_alerts')
      .select('id, crypto_id, alert_type, target_price, user_id')
      .eq('is_active', true);

    if (!alerts || alerts.length === 0) return;

    const uniqueIds = [...new Set(alerts.map((a) => a.crypto_id as string))];

    let prices: Record<string, { usd: number }>;
    try {
      prices = await this.coingecko.getSimplePrice(uniqueIds);
    } catch {
      this.logger.warn('Falha ao buscar preços para verificação de alertas.');
      return;
    }

    const triggered = alerts.filter((alert) => {
      const price = prices[alert.crypto_id]?.usd;
      if (price === undefined) return false;
      return alert.alert_type === 'above'
        ? price >= alert.target_price
        : price <= alert.target_price;
    });

    if (triggered.length === 0) return;

    const ids = triggered.map((a) => a.id);
    await admin
      .from('price_alerts')
      .update({ is_active: false, triggered_at: new Date().toISOString() })
      .in('id', ids);

    this.logger.log(`${triggered.length} alerta(s) disparado(s).`);
  }
}
