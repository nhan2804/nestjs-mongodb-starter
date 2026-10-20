import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Citizen } from 'src/citizens/entities/citizens.entity';
import { ExamSession } from 'src/exam-sessions/entities/exam-sessions.entity';

export type ExamRecordDocument = ExamRecord & Document;

@Schema({ _id: false })
export class Attendance {
  @Prop({ default: false, index: true })
  arrived: boolean;

  @Prop({ type: Date, default: null })
  arrivedAt?: Date | null;

  @Prop({ type: String, default: null })
  arrivedBy?: string | null;
}
export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

@Schema({ _id: false })
export class ExamPhoto {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  path: string;

  @Prop({ default: false })
  isPrimary: boolean;

  @Prop({ type: Date, default: () => new Date() })
  capturedAt: Date;

  @Prop({ required: true })
  capturedBy: string;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;

  @Prop({ type: String, default: null })
  deletedBy?: string | null;

  @Prop({ type: String, default: null })
  trashPath?: string | null;
}
export const ExamPhotoSchema = SchemaFactory.createForClass(ExamPhoto);

@Schema({
  collection: 'exam_records',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class ExamRecord {
  @Prop({ type: String, ref: Citizen.name, required: true, index: true })
  citizenId: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: ExamSession.name, required: true, index: true })
  sessionId: Types.ObjectId;

  @Prop({ required: true, index: true })
  scheduledDate: string; // YYYY-MM-DD

  @Prop({ required: true, index: true })
  village: string;

  @Prop({ type: AttendanceSchema, default: () => ({ arrived: false, arrivedAt: null, arrivedBy: null }) })
  attendance: Attendance;

  @Prop({ default: '' })
  note: string;

  @Prop({ type: [ExamPhotoSchema], default: [] })
  photos: ExamPhoto[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const ExamRecordSchema = SchemaFactory.createForClass(ExamRecord);

ExamRecordSchema.index({ citizenId: 1, sessionId: 1 }, { unique: true });
ExamRecordSchema.index({ sessionId: 1, scheduledDate: 1, village: 1 });
ExamRecordSchema.index({ sessionId: 1, 'attendance.arrived': 1 });
ExamRecordSchema.index({ createdAt: -1 });

ExamRecordSchema.virtual('citizen', {
  ref: Citizen.name,
  localField: 'citizenId',
  foreignField: '_id',
  justOne: true,
});
