import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
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
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private usersService: UsersService,
    private readonly httpService: HttpService,
    private configService: ConfigService,
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
  async profile(@UserLoggin() user: UserDocument): Promise<User> {
    const u = await this.usersService.findOnePublic(user?._id);
    return u;
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
    console.log({ data });

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
    return this.authService.login(req.user);
  }
}
