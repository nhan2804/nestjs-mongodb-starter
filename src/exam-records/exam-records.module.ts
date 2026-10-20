import { Module } from '@nestjs/common';
import { ExamRecordsService } from './exam-records.service';
import { ExamRecordsController } from './exam-records.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamRecord, ExamRecordSchema } from './entities/exam-records.entity';
import { ExamSession, ExamSessionSchema } from 'src/exam-sessions/entities/exam-sessions.entity';
import { Citizen, CitizenSchema } from 'src/citizens/entities/citizens.entity';
import { AuditLogsModule } from 'src/audit-logs/audit-logs.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [ExamRecordsController],
  providers: [ExamRecordsService],
  imports: [
    MongooseModule.forFeature([
      { name: ExamRecord.name, schema: ExamRecordSchema },
      { name: ExamSession.name, schema: ExamSessionSchema },
      { name: Citizen.name, schema: CitizenSchema },
    ]),
    AuditLogsModule,
    ConfigModule,
  ],
  exports: [ExamRecordsService, MongooseModule],
})
export class ExamRecordsModule {}
