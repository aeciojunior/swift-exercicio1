import { Body, Controller, Get, Put } from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import {
  AccessToken,
  CurrentUser,
} from '../common/decorators/current-user.decorator';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { PreferencesService } from './preferences.service';

@Controller('preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get()
  getPreferences(@CurrentUser() user: User, @AccessToken() token: string) {
    return this.preferencesService.getPreferences(user.id, token);
  }

  @Put()
  upsertPreferences(
    @CurrentUser() user: User,
    @AccessToken() token: string,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.preferencesService.upsertPreferences(user.id, dto, token);
  }
}
