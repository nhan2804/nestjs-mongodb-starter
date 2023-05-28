import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectsModule } from './projects/projects.module';
import { FilterMiddleware } from './middleware/filter.middleware';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth/auth.service';
import { LocalStrategy } from './auth/strategy/auth.local';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/strategy/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/auth.guard';
import { ConfigModule } from '@nestjs/config';
import { PlacesModule } from './places/places.module';
import { OptionsModule } from './options/options.module';
import { SubmitsModule } from './submits/submits.module';
import { UploadModule } from './upload/upload.module';
import { CheckinModule } from './checkin/checkin.module';
import { GroupQuestionModule } from './group-question/group-question.module';
import { GroupUsersModule } from './group-users/group-users.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { LogsubmitsModule } from './logsubmits/logsubmits.module';
import { TicketsModule } from './tickets/tickets.module';
import { DepartmentsModule } from './departments/departments.module';

@Module({
  imports: [
    ProjectsModule,
    MongooseModule.forRoot(
      process.env?.mode == 'PRODUCTION'
        ? 'mongodb+srv://nhan2804:eUpyLWXZIqlYsrTF@cluster0.gnakj.mongodb.net/scaffold-project?retryWrites=true&w=majority'
        : 'mongodb+srv://nhan2804:eUpyLWXZIqlYsrTF@cluster0.gnakj.mongodb.net/scaffold-project?retryWrites=true&w=majority',
    ),
    AuthModule,
    UsersModule,
    PassportModule,
    JwtModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CheckinModule,
    OptionsModule,
    SubmitsModule,
    UploadModule,

    PlacesModule,

    GroupQuestionModule,

    GroupUsersModule,

    DashboardModule,

    LogsubmitsModule,

    TicketsModule,
    DepartmentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthService,
    LocalStrategy,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('/*');
    consumer
      .apply(FilterMiddleware)
      .exclude({ path: '/public/*', method: RequestMethod.ALL })
      .forRoutes('/*');
  }
}
