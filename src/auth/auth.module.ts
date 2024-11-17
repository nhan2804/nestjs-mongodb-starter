import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategy/auth.local';
import { JwtStrategy } from './strategy/jwt.strategy';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthSessionsModule } from 'src/auth-sessions/auth-sessions.module';
import { ActivitysModule } from 'src/activitys/activitys.module';
@Module({
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  imports: [
    AuthSessionsModule,
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') || 'GOOD_LUCK_TO_YOU_1080',
        signOptions: { expiresIn: '60m' },
      }),
    }),
    HttpModule,
    ActivitysModule,
  ],
})
export class AuthModule {}
