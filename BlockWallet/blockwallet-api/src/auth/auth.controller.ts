import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { Public } from '../common/decorators/public.decorator';
import { AccessToken, CurrentUser } from '../common/decorators/current-user.decorator';
import type { User } from '@supabase/supabase-js';
import { IsString } from 'class-validator';

class RefreshDto { @IsString() refreshToken: string; }
class ResetPasswordDto { @IsString() email: string; }

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sign-up')
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  signOut(@AccessToken() token: string) {
    return this.authService.signOut(token);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPasswordRequest(dto.email);
  }

  @Post('me')
  @HttpCode(HttpStatus.OK)
  me(@CurrentUser() user: User) {
    return { id: user.id, email: user.email, metadata: user.user_metadata };
  }
}
