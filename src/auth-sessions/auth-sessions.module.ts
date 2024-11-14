import { Module } from '@nestjs/common';
import { AuthSessionsService } from './auth-sessions.service';
import { AuthSessionsController } from './auth-sessions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AuthSession,
  AuthSessionSchema,
} from './entities/auth-sessions.entity';
import { AuthSessionTask } from './tasks/delete-expire.auth-session.task';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AuthSessionsController],
  providers: [AuthSessionsService, AuthSessionTask],
  imports: [
    MongooseModule.forFeature([
      { name: AuthSession.name, schema: AuthSessionSchema },
    ]),
    JwtModule,
  ],

  exports: [AuthSessionsService],
})
export class AuthSessionsModule {}
