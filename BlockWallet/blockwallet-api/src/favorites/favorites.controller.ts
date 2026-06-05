import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import {
  AccessToken,
  CurrentUser,
} from '../common/decorators/current-user.decorator';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findAll(@CurrentUser() user: User, @AccessToken() token: string) {
    return this.favoritesService.findAll(user.id, token);
  }

  @Post()
  add(
    @CurrentUser() user: User,
    @AccessToken() token: string,
    @Body() dto: AddFavoriteDto,
  ) {
    return this.favoritesService.add(user.id, dto, token);
  }

  @Delete(':cryptoId')
  remove(
    @Param('cryptoId') cryptoId: string,
    @CurrentUser() user: User,
    @AccessToken() token: string,
  ) {
    return this.favoritesService.remove(user.id, cryptoId, token);
  }

  @Get(':cryptoId/check')
  check(
    @Param('cryptoId') cryptoId: string,
    @CurrentUser() user: User,
    @AccessToken() token: string,
  ) {
    return this.favoritesService.isFavorite(user.id, cryptoId, token);
  }
}
