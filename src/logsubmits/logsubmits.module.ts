import { Module } from '@nestjs/common';
import { LogsubmitsService } from './logsubmits.service';
import { LogsubmitsController } from './logsubmits.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Logsubmit, LogsubmitSchema } from './entities/logsubmit.entity';

@Module({
  controllers: [LogsubmitsController],
  providers: [LogsubmitsService],
  imports: [
    MongooseModule.forFeature([
      { name: Logsubmit.name, schema: LogsubmitSchema },
    ]),
  ],
  exports: [LogsubmitsService],
})
export class LogsubmitsModule {}
