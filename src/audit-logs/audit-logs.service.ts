import { Injectable, Logger } from '@nestjs/common';
import { AbstractService } from 'src/app/services/abstract.service';
import { AuditLog, AuditLogDocument } from './entities/audit-logs.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AuditLogsService extends AbstractService<AuditLog> {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(
    @InjectModel(AuditLog.name)
    readonly model: Model<AuditLogDocument>,
  ) {
    super(model);
  }

  async logAction(data: Partial<AuditLog>): Promise<AuditLogDocument | null> {
    try {
      return await this.model.create(data);
    } catch (err) {
      this.logger.error(`Failed to create audit log for ${data.action}: ${err.message}`, err.stack);
      return null;
    }
  }
}
