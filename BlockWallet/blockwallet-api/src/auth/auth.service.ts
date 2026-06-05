import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(private readonly supabase: SupabaseService) {}

  async signUp(dto: SignUpDto) {
    const { data, error } = await this.supabase.getAdminClient().auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
      user_metadata: { display_name: dto.displayName ?? dto.email.split('@')[0] },
    });

    if (error) throw new BadRequestException(error.message);
    return { user: data.user };
  }

  async signIn(dto: SignInDto) {
    const { data, error } = await this.supabase
      .getClientWithToken('')
      .auth.signInWithPassword({ email: dto.email, password: dto.password });

    if (error) throw new UnauthorizedException(error.message);
    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    const client = this.supabase.getAdminClient();
    const { data, error } = await client.auth.refreshSession({ refresh_token: refreshToken });

    if (error) throw new UnauthorizedException(error.message);
    return {
      accessToken: data.session!.access_token,
      refreshToken: data.session!.refresh_token,
      expiresAt: data.session!.expires_at,
    };
  }

  async signOut(accessToken: string) {
    const client = this.supabase.getClientWithToken(accessToken);
    const { error } = await client.auth.signOut();
    if (error) throw new BadRequestException(error.message);
    return { message: 'Sessão encerrada com sucesso.' };
  }

  async resetPasswordRequest(email: string) {
    const admin = this.supabase.getAdminClient();
    const { error } = await admin.auth.resetPasswordForEmail(email);
    if (error) throw new BadRequestException(error.message);
    return { message: 'E-mail de recuperação enviado.' };
  }
}
