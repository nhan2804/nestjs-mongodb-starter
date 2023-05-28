import { Module } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { CheckinController } from './checkin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Checkin, CheckinSchema } from './entities/checkin.entity';

@Module({
  controllers: [CheckinController],
  providers: [CheckinService],
  imports: [
    MongooseModule.forFeature([{ name: Checkin.name, schema: CheckinSchema }]),
  ],
})
export class CheckinModule {}
