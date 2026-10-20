import { Module } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogsController } from './audit-logs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLog, AuditLogSchema } from './entities/audit-logs.entity';

@Module({
  controllers: [AuditLogsController],
  providers: [AuditLogsService],
  imports: [
    MongooseModule.forFeature([{ name: AuditLog.name, schema: AuditLogSchema }]),
  ],
  exports: [AuditLogsService, MongooseModule],
})
export class AuditLogsModule {}
