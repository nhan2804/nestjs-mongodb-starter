import { Injectable } from '@nestjs/common';
import { AbstractService } from 'src/app/services/abstract.service';
import { AuthSession, AuthSessionDocument } from './entities/auth-sessions.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AuthSessionsService extends AbstractService<AuthSession> {
  constructor(
    @InjectModel(AuthSession.name)
    readonly model: Model<AuthSessionDocument>,
  ) {
    super(model);
  }
}
