import { Module } from '@nestjs/common';
import { SubmitsService } from './submits.service';
import { SubmitsController } from './submits.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Submit, SubmitSchema } from './entities/submit.entity';
import { PlacesModule } from 'src/places/places.module';
import { LogsubmitsModule } from 'src/logsubmits/logsubmits.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [SubmitsController],
  providers: [SubmitsService],
  imports: [
    MongooseModule.forFeature([{ name: Submit.name, schema: SubmitSchema }]),
    PlacesModule,
    LogsubmitsModule,
    UsersModule,
  ],
  exports: [SubmitsService],
})
export class SubmitsModule {}
