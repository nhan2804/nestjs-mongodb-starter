import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Inject,
  NotFoundException,
  BadRequestException,
  UsePipes,
  ValidationPipe,
  UnauthorizedException,
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
import { ChangePasswordDto } from './dto/change-password';
import { UpdateAuthDto } from './dto/update-auth.dto';
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
  @Get('get-all-data')
  async getData() {
    //Get all keys
    const keys = await this.cacheManager.store.keys();

    //Loop through keys and get data
    const allData: { [key: string]: any } = {};
    for (const key of keys) {
      allData[key] = await this.cacheManager.get(key);
    }
    return allData;
  }
  // @Public()
  // @Post('/register')
  // async createUser(
  //   @Body('password') password: string,
  //   @Body('username') username: string,
  // ): Promise<User> {
  //   const saltOrRounds = 10;
  //   const hashedPassword = await bcrypt.hash(password, saltOrRounds);
  //   const result = await this.usersService.createUser(username, hashedPassword);
  //   return result;
  // }
  @Get('/profile')
  async profile(@UserLoggin() user: any): Promise<any> {
    const u = await this.usersService.findOnePublic(user?._id);
    return {
      ...u?.toObject(),
      authSessionKey: user?.authSessionKey,
    };
  }
  @Post('/logout-session')
  async logoutSession(
    @UserLoggin() user: any,
    @Body('authSessionKey') authSessionKey: string | string[],
  ): Promise<any> {
    const rs = await this.authSessionService.deleteAuthSessions({
      sessions: authSessionKey,
      ownerId: user?._id,
    });
    return rs;
  }
  @Post('/logout')
  async logout(@UserLoggin() user: any): Promise<any> {
    const rs = await this.authSessionService.deleteAuthSessions({
      sessions: user?.authSessionKey,
      ownerId: user?._id,
    });
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
  async login(@Request() req, @Body('geoInfo') geoInfo: any) {
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
      geoInfo,
    });
    return user;
  }
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  @Post('change-password')
  async changePassword(
    @Body() body: ChangePasswordDto,
    @UserLoggin() u: UserDocument,
  ) {
    const user = await this.usersService.findOne({ _id: u?._id });

    if (!user) throw new NotFoundException();
    const saltOrRounds = 10;
    const isMatch = await bcrypt.compare(body.oldPassword, user.password);
    if (!isMatch) throw new BadRequestException('Password cũ không chính xác!');
    const isSamePassword = await bcrypt.compare(
      body.newPassword,
      user.password,
    );
    if (isSamePassword)
      throw new BadRequestException('Password mới phải khác password cũ!');
    user.password = await bcrypt.hash(body.newPassword, saltOrRounds);
    user.otp = nanoid(10);

    await user.save();
    //NNN thay vì xử lý nữa, tôi quyết định hacking
    throw new UnauthorizedException({
      skipAlert: true,
    });
    return user;
  }
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  @Post('update')
  async updateProfile(
    @Body() body: UpdateAuthDto,
    @UserLoggin() u: UserDocument,
  ) {
    const user = await this.usersService.findOne({ _id: u?._id });

    if (!user) throw new NotFoundException();
    if (body.fullName) {
      user.fullName = body.fullName;
    }

    if (body.avatar) {
      user.avatar = body.avatar;
    }

    // Save the updated user document to the database
    await user.save();
    // ...rest logic
    return user;
  }
}
