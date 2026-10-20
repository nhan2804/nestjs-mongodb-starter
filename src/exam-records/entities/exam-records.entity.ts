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

@Schema({ _id: false })
export class PhysicalMetrics {
  @Prop({ type: Number, default: null })
  height?: number | null; // Cao (cm)

  @Prop({ type: Number, default: null })
  weight?: number | null; // Cân nặng (kg)

  @Prop({ type: Number, default: null })
  chest?: number | null; // Vòng ngực trung bình (cm)
}
export const PhysicalMetricsSchema = SchemaFactory.createForClass(PhysicalMetrics);

@Schema({ _id: false })
export class HealthExam {
  @Prop({ type: PhysicalMetricsSchema, default: () => ({}) })
  physical?: PhysicalMetrics;

  @Prop({ type: String, default: '' })
  healthStatus?: string; // Tình trạng sức khỏe và bệnh tật

  @Prop({ type: Boolean, default: null })
  isQualified?: boolean | null; // Đủ điều kiện sức khỏe khám NVQS

  @Prop({ type: Boolean, default: null })
  isDisqualified?: boolean | null; // Không đủ điều kiện sức khỏe khám NVQS

  @Prop({ type: String, default: '' })
  exemptCategory?: string; // Thuộc diện miễn làm NVQS

  @Prop({ type: String, default: '' })
  otherReason?: string; // Lý do khác (ghi cụ thể)

  @Prop({ type: String, default: '' })
  healthNote?: string; // Ghi chú sức khỏe

  @Prop({ type: Date, default: null })
  updatedAt?: Date | null;

  @Prop({ type: String, default: null })
  updatedBy?: string | null;
}
export const HealthExamSchema = SchemaFactory.createForClass(HealthExam);

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

  @Prop({ type: HealthExamSchema, default: null })
  healthExam?: HealthExam;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ExamRecordSchema = SchemaFactory.createForClass(ExamRecord);

ExamRecordSchema.index({ citizenId: 1, sessionId: 1 }, { unique: true });
ExamRecordSchema.index({ sessionId: 1, scheduledDate: 1, village: 1 });
ExamRecordSchema.index({ sessionId: 1, 'attendance.arrived': 1 });
ExamRecordSchema.index({ sessionId: 1, 'healthExam.isQualified': 1 });
ExamRecordSchema.index({ createdAt: -1 });

ExamRecordSchema.virtual('citizen', {
  ref: Citizen.name,
  localField: 'citizenId',
  foreignField: '_id',
  justOne: true,
});
