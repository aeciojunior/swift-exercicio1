import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get()
  root() {
    return this.healthPayload();
  }

  @Public()
  @Get('health')
  health() {
    return this.healthPayload();
  }

  private healthPayload() {
    return {
      status: 'ok',
      service: 'blockwallet-api',
      timestamp: new Date().toISOString(),
    };
  }
}
