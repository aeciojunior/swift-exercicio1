import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import {
  AccessToken,
  CurrentUser,
} from '../common/decorators/current-user.decorator';
import { BuyDto, SellDto } from './dto/transaction.dto';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  getWallet(@CurrentUser() user: User, @AccessToken() token: string) {
    return this.walletService.getWallet(user.id, token);
  }

  @Get(':cryptoId')
  getWalletItem(
    @Param('cryptoId') cryptoId: string,
    @CurrentUser() user: User,
    @AccessToken() token: string,
  ) {
    return this.walletService.getWalletItem(user.id, cryptoId, token);
  }

  @Post('buy')
  buy(
    @CurrentUser() user: User,
    @AccessToken() token: string,
    @Body() dto: BuyDto,
  ) {
    return this.walletService.buy(user.id, dto, token);
  }

  @Post('sell')
  sell(
    @CurrentUser() user: User,
    @AccessToken() token: string,
    @Body() dto: SellDto,
  ) {
    return this.walletService.sell(user.id, dto, token);
  }
}
