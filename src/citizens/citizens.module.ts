import { Module } from '@nestjs/common';
import { CitizensService } from './citizens.service';
import { CitizensController } from './citizens.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Citizen, CitizenSchema } from './entities/citizens.entity';
import {
  ExamRecord,
  ExamRecordSchema,
} from 'src/exam-records/entities/exam-records.entity';
import {
  ExamSession,
  ExamSessionSchema,
} from 'src/exam-sessions/entities/exam-sessions.entity';
import { AuditLogsModule } from 'src/audit-logs/audit-logs.module';

@Module({
  controllers: [CitizensController],
  providers: [CitizensService],
  imports: [
    MongooseModule.forFeature([
      { name: Citizen.name, schema: CitizenSchema },
      { name: ExamRecord.name, schema: ExamRecordSchema },
      { name: ExamSession.name, schema: ExamSessionSchema },
    ]),
    AuditLogsModule,
  ],
  exports: [CitizensService, MongooseModule],
})
export class CitizensModule {}
