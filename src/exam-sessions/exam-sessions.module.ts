import { Module } from '@nestjs/common';
import { ExamSessionsService } from './exam-sessions.service';
import { ExamSessionsController } from './exam-sessions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamSession, ExamSessionSchema } from './entities/exam-sessions.entity';

@Module({
  controllers: [ExamSessionsController],
  providers: [ExamSessionsService],
  imports: [
    MongooseModule.forFeature([{ name: ExamSession.name, schema: ExamSessionSchema }]),
  ],
  exports: [ExamSessionsService, MongooseModule],
})
export class ExamSessionsModule {}
