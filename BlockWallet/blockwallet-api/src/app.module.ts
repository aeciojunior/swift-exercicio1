import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import configuration from './config/configuration';
import { SupabaseModule } from './supabase/supabase.module';
import { CoingeckoModule } from './coingecko/coingecko.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { PreferencesModule } from './preferences/preferences.module';
import { CoinsModule } from './coins/coins.module';
import { WalletModule } from './wallet/wallet.module';
import { TransactionsModule } from './transactions/transactions.module';
import { FavoritesModule } from './favorites/favorites.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { AlertsModule } from './alerts/alerts.module';
import { SupabaseAuthGuard } from './common/guards/supabase-auth.guard';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [{ ttl: 60000, limit: 60 }],
      }),
    }),
    ScheduleModule.forRoot(),
    SupabaseModule,
    CoingeckoModule,
    AuthModule,
    ProfileModule,
    PreferencesModule,
    CoinsModule,
    WalletModule,
    TransactionsModule,
    FavoritesModule,
    PortfolioModule,
    AlertsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: SupabaseAuthGuard },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    AppService,
  ],
  controllers: [AppController],
})
export class AppModule {}
