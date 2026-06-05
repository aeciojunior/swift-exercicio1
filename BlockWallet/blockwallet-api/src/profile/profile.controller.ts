import { Body, Controller, Get, Patch } from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import {
  AccessToken,
  CurrentUser,
} from '../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(@CurrentUser() user: User, @AccessToken() token: string) {
    return this.profileService.getProfile(user.id, token);
  }

  @Patch()
  updateProfile(
    @CurrentUser() user: User,
    @AccessToken() token: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(user.id, dto, token);
  }

  @Get('dashboard')
  getDashboard(@CurrentUser() user: User, @AccessToken() token: string) {
    return this.profileService.getDashboardSummary(user.id, token);
  }
}
