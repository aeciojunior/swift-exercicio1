import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import {
  AccessToken,
  CurrentUser,
} from '../common/decorators/current-user.decorator';
import { CreateSnapshotDto } from './dto/create-snapshot.dto';
import { PortfolioService } from './portfolio.service';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get('snapshots')
  getSnapshots(
    @CurrentUser() user: User,
    @AccessToken() token: string,
    @Query('days') days = '30',
  ) {
    return this.portfolioService.getSnapshots(user.id, token, +days);
  }

  @Get('snapshots/latest')
  getLatest(@CurrentUser() user: User, @AccessToken() token: string) {
    return this.portfolioService.getLatestSnapshot(user.id, token);
  }

  @Post('snapshots')
  upsertSnapshot(
    @CurrentUser() user: User,
    @AccessToken() token: string,
    @Body() dto: CreateSnapshotDto,
  ) {
    return this.portfolioService.upsertSnapshot(user.id, dto, token);
  }
}
