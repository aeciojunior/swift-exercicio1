import { Module } from '@nestjs/common';
import { CoingeckoModule } from '../coingecko/coingecko.module';
import { CoinsController } from './coins.controller';
import { CoinsService } from './coins.service';

@Module({
  imports: [CoingeckoModule],
  controllers: [CoinsController],
  providers: [CoinsService],
})
export class CoinsModule {}
