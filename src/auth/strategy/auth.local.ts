import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService, // private readonly jwt: JwtService,
  ) {
    super();
  }

  async validate(
    username: string,
    password: string,

    done,
  ): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    //check if user.otp === otpJWT
    if (!user) {
      throw new UnauthorizedException();
    }
    done(null, { ...user?.toObject() });
  }
}
