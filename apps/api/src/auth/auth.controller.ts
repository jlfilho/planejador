import { Body, Controller, Get, HttpCode, Inject, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { Public } from './decorators';
import { UsersService } from '../users/users.service';
import { isProduction } from '../common/security-config';

export const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: 'lax' as const,
  path: '/api/v1/auth',
  maxAge: Number(process.env.REFRESH_TTL_DAYS ?? 7) * 86400000,
});

const cookie = (res: any, token: string) => res.cookie('refresh_token', token, refreshCookieOptions());

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService, @Inject(UsersService) private readonly users: UsersService) {}

  @Public()
  @Post('register')
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 409 })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: any) {
    const result = await this.auth.register(dto.email, dto.password);
    cookie(res, result.session.token);
    return { accessToken: await this.auth.access(result.user, result.session.id), user: this.users.publicView(result.user) };
  }

  @Public()
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 429 })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: any) {
    const result = await this.auth.authenticate(dto.email, dto.password);
    cookie(res, result.session.token);
    return { accessToken: await this.auth.access(result.user, result.session.id), user: this.users.publicView(result.user) };
  }

  @Public()
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('refresh')
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401 })
  @ApiResponse({ status: 429 })
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: any) {
    const token = req.cookies?.refresh_token;
    if (!token) throw new UnauthorizedException('Invalid session');
    const result = await this.auth.refresh(token);
    cookie(res, result.session.token);
    return { accessToken: await this.auth.access(result.user, result.session.id) };
  }

  @Public()
  @HttpCode(204)
  @Post('logout')
  @ApiResponse({ status: 204 })
  async logout(@Req() req: any, @Res({ passthrough: true }) res: any) {
    await this.auth.logout(req.cookies?.refresh_token);
    const { maxAge: _maxAge, ...options } = refreshCookieOptions();
    res.clearCookie('refresh_token', options);
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401 })
  async me(@Req() req: any) {
    const user = await this.users.byId(req.user.sub);
    if (!user || !user.isActive) throw new UnauthorizedException();
    return this.users.publicView(user);
  }
}
