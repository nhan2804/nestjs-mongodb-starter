import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthSessionsService } from '../auth-sessions.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthSessionTask {
  constructor(
    private readonly authSessionsService: AuthSessionsService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  private readonly logger = new Logger(AuthSessionTask.name);

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    const sessions = await this.authSessionsService.findAll(
      {},
      { accessToken: 1, _id: 1 },
      {
        limit: 1000,
      },
    );

    const tokensExpired = sessions?.filter((e) => {
      try {
        this.jwtService.verify(e?.accessToken, {
          secret:
            this.configService.get('JWT_SECRET') || 'GOOD_LUCK_TO_YOU_1080',
        });
        return false;
      } catch (error) {
        return true;
      }
    });
    const rs = await this.authSessionsService.deleteMany({
      _id: {
        $in: tokensExpired?.map((e) => e?._id),
      },
    });
    // console.log(`${rs.deletedCount} has been deleted!`);
  }
}
