import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import {
  AccessToken,
  CurrentUser,
} from '../common/decorators/current-user.decorator';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  findAll(
    @CurrentUser() user: User,
    @AccessToken() token: string,
    @Query('active') active?: string,
  ) {
    return this.alertsService.findAll(user.id, token, active === 'true');
  }

  @Post()
  create(
    @CurrentUser() user: User,
    @AccessToken() token: string,
    @Body() dto: CreateAlertDto,
  ) {
    return this.alertsService.create(user.id, dto, token);
  }

  @Patch(':id/deactivate')
  deactivate(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @AccessToken() token: string,
  ) {
    return this.alertsService.deactivate(user.id, id, token);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @AccessToken() token: string,
  ) {
    return this.alertsService.remove(user.id, id, token);
  }
}
