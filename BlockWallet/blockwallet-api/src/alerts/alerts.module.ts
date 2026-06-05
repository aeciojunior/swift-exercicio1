import { Module } from '@nestjs/common';
import { CoingeckoModule } from '../coingecko/coingecko.module';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';

@Module({
  imports: [CoingeckoModule],
  controllers: [AlertsController],
  providers: [AlertsService],
})
export class AlertsModule {}
