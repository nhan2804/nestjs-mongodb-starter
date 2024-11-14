import { Inject, Injectable } from '@nestjs/common';
import { AbstractService } from 'src/app/services/abstract.service';
import {
  AuthSession,
  AuthSessionDocument,
} from './entities/auth-sessions.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
@Injectable()
export class AuthSessionsService extends AbstractService<AuthSession> {
  constructor(
    @InjectModel(AuthSession.name)
    readonly model: Model<AuthSessionDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super(model);
  }
  async getAuthSession({ authSessionKey, ownerId }): Promise<boolean> {
    const cacheKey = `auth_session_${authSessionKey}`;
    const cachedValue = await this.cacheManager.get<string>(cacheKey);
    if (cachedValue) {
      return true;
    }
    const authSession = await this.findOne({
      ownerId: new Types.ObjectId(ownerId),
      authSessionKey: authSessionKey,
    });
    if (!authSession) {
      return false;
    }
    await this.cacheManager.set(cacheKey, true, 1000 * 60 * 5);
    return true;
  }
  async deleteAuthSessions({
    sessions,
    ownerId,
  }: {
    sessions: string | string[];
    ownerId: string;
  }): Promise<boolean> {
    const ses = Array.isArray(sessions) ? sessions : [sessions];

    const authSession = await this.findAll(
      {
        ownerId: new Types.ObjectId(ownerId),
        ...(sessions && {
          authSessionKey: {
            $in: ses,
          },
        }),
      },
      {
        authSessionKey: 1,
        _id: 1,
        ownerId: 1,
      },
    );
    const userId = authSession?.[0]?.ownerId;
    for (const e of authSession) {
      await this.cacheManager.del(`auth_session_${e.authSessionKey}`);
    }
    if (userId) {
      await this.cacheManager.del(`user_jwt_${userId?.toString()}`);
    }

    await this.deleteMany({
      _id: {
        $in: authSession?.map((e) => e?._id),
      },
    });

    return true;
  }
}
