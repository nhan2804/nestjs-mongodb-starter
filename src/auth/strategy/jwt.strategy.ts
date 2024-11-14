import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { AuthSessionsService } from 'src/auth-sessions/auth-sessions.service';
import { Types } from 'mongoose';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UsersService,
    private authSessionService: AuthSessionsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'GOOD_LUCK_TO_YOU_1080',
    });
  }

  async validate(payload: any) {
    const _id = payload?.sub;
    const user = await this.userService.findOneV2(_id);
    //NNN note: cái otp này là v1, nên chỉ cho phép logout all device bằng cách update otp, nhưng giờ có cách dưới để logout từng device 1, nên khỏi cần cũng đc
    // for function force logout all device
    if (user?.otp?.toString() !== payload?.otp?.toString()) {
      return false;
    }
    const validSessionToken = await this.authSessionService.getAuthSession({
      ownerId: new Types.ObjectId(_id),
      authSessionKey: payload?.authSessionKey,
    });
    if (!validSessionToken) {
      return false;
    }

    return {
      ...payload,
      _id: payload.sub,
      username: payload.username,
      fullName: payload.fullName,
    };
  }
}
