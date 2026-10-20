import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

export enum AuditAction {
  CITIZEN_IMPORT = 'citizen.import',
  ATTENDANCE_CHECK_IN = 'attendance.check_in',
  ATTENDANCE_UNDO = 'attendance.undo',
  RECORD_NOTE_UPDATE = 'record.note_update',
  RECORD_SCHEDULE_UPDATE = 'record.schedule_update',
  PHOTO_UPLOAD = 'photo.upload',
  PHOTO_DELETE = 'photo.delete',
  PHOTO_RESTORE = 'photo.restore',
  PHOTO_SET_PRIMARY = 'photo.set_primary',
  HEALTH_EXAM_UPDATE = 'health_exam.update',
}

@Schema({
  collection: 'audit_logs',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class AuditLog {
  @Prop({ required: true, index: true })
  action: string;

  @Prop({ required: true, index: true })
  entityType: string;

  @Prop({ required: true, index: true })
  entityId: string;

  @Prop({ index: true })
  actorId?: string;

  @Prop()
  actorName?: string;

  @Prop({ type: SchemaTypes.Mixed })
  before?: any;

  @Prop({ type: SchemaTypes.Mixed })
  after?: any;

  @Prop({ type: SchemaTypes.Mixed })
  metadata?: any;

  createdAt?: Date;
  updatedAt?: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
AuditLogSchema.index({ actorId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: -1 });
