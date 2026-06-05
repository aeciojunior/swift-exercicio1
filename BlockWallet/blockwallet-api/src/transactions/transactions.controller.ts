import { Controller, Get, Param, Query } from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import {
  AccessToken,
  CurrentUser,
} from '../common/decorators/current-user.decorator';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll(
    @CurrentUser() user: User,
    @AccessToken() token: string,
    @Query('crypto_id') cryptoId?: string,
    @Query('type') type?: string,
    @Query('page') page = '1',
    @Query('per_page') perPage = '20',
  ) {
    return this.transactionsService.findAll(
      user.id, token, cryptoId, type, +page, +perPage,
    );
  }

  @Get('summary')
  getSummary(@CurrentUser() user: User, @AccessToken() token: string) {
    return this.transactionsService.getSummary(user.id, token);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @AccessToken() token: string,
  ) {
    return this.transactionsService.findOne(user.id, id, token);
  }
}
