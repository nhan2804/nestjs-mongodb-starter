import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExamSessionDocument = ExamSession & Document;

export enum ExamPhase {
  PRELIMINARY = 'preliminary',
  OFFICIAL = 'official',
}

export enum ServiceType {
  MILITARY = 'military',
  POLICE = 'police',
}

@Schema({
  collection: 'exam_sessions',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class ExamSession {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, type: Number })
  year: number;

  @Prop({ required: true, enum: ['preliminary', 'official'], default: 'preliminary' })
  phase: string;

  @Prop({ required: true, enum: ['military', 'police'], default: 'military' })
  serviceType: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  description?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ExamSessionSchema = SchemaFactory.createForClass(ExamSession);
ExamSessionSchema.index({ year: 1, phase: 1, serviceType: 1 });
ExamSessionSchema.index({ isActive: 1 });
ExamSessionSchema.index({ createdAt: -1 });
