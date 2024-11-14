import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './public';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { AuthSessionsService } from 'src/auth-sessions/auth-sessions.service';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private authSessionService: AuthSessionsService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err, user, info, excutionContext: ExecutionContext) {
    if (err || !user?._id) {
      // NNN comment vì đã có crontask cover
      const token = excutionContext
        .switchToHttp()
        .getRequest()
        .headers.authorization?.split(' ')[1];

      if (token) {
        const decoded = this.jwtService.decode(token) as any; // Decode without verifying
        if (decoded?.authSessionKey) {
          //NNN kiểu này không ổn
          this.authSessionService.deleteAuthSessions({
            sessions: decoded?.authSessionKey,
            ownerId: decoded?.sub || decoded?._id,
          });
        }
      }
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
