import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Inject,
} from '@nestjs/common';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { AuthGuard } from '@nestjs/passport';
import { UserLoggin } from './decorators/user';
import { Public } from './guards/public';
import { HttpService } from '@nestjs/axios/dist';
import { catchError, firstValueFrom, Observable } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';
import { AuthSessionsService } from 'src/auth-sessions/auth-sessions.service';
import { Types } from 'mongoose';
import { nanoid } from 'nanoid';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private usersService: UsersService,
    private readonly httpService: HttpService,
    private configService: ConfigService,
    private authSessionService: AuthSessionsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Public()
  @Post('/register')
  async createUser(
    @Body('password') password: string,
    @Body('username') username: string,
  ): Promise<User> {
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);
    const result = await this.usersService.createUser(username, hashedPassword);
    return result;
  }
  @Get('/profile')
  async profile(@UserLoggin() user: any): Promise<any> {
    const u = await this.usersService.findOnePublic(user?._id);
    return {
      ...u?.toObject(),
      authSessionKey: user?.authSessionKey,
    };
    return u;
  }
  @Post('/logout')
  async logout(@UserLoggin() user: any): Promise<any> {
    await this.usersService.updateOne(new Types.ObjectId(user?._id), {
      otp: nanoid(10),
    } as any);
    const rs = await this.authSessionService.deleteMany({
      ownerId: new Types.ObjectId(user?._id),
    });
    await this.cacheManager.del(`user_jwt_${user?._id?.toString()}`);
    return rs;
  }
  @Public()
  @Post('/sso')
  async sso(@Body('sso-token') ssoToken: string): Promise<any> {
    const url = `${this.configService.get('URL_SSO')}v1/api/auth/profile`;

    const { data } = await firstValueFrom(
      this.httpService
        .get(url, {
          headers: {
            Authorization: `Bearer ${ssoToken}`,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw 'An error happened!';
          }),
        ),
    );

    const sign = await this.authService.loginSSO({
      ssoEmail: data?.email,
      ssoFullName: data?.fullName + 'From SSO',
      ssoId: data?._id,
    });
    return { ...sign };
    // return userfs;
  }

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    const user = await this.authService.login(req.user);
    // Lấy userAgent từ header 'User-Agent'
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Lấy IP từ request
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const rs = await this.authSessionService.create({
      authSessionKey: user?.authSessionKey,
      userAgent,
      ip,
      ownerId: user?.user?._id,
      accessToken: user?.access_token,
    });
    return user;
  }
}
