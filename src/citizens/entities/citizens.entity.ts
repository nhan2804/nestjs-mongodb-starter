import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

export type CitizenDocument = Citizen & Document<string>;

@Schema({
  collection: 'citizens',
  timestamps: true,
  _id: false, // Explicitly tell mongoose we manage string _id
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Citizen {
  @Prop({ type: String, required: true, trim: true })
  _id: string; // CCCD 12 digits

  @Prop({ type: Number })
  index?: number;

  @Prop({ type: Number })
  idx?: number;

  @Prop({ required: true, trim: true, index: true })
  fullName: string;

  @Prop({ trim: true })
  birthDate?: string;

  @Prop({ trim: true })
  address?: string;

  @Prop({ trim: true, index: true })
  village?: string;

  @Prop({ trim: true })
  rawVillage?: string;

  @Prop({ trim: true })
  carrer?: string;

  @Prop({ trim: true })
  workplace?: string;

  @Prop({ trim: true })
  father?: string;

  @Prop({ trim: true })
  mother?: string;

  @Prop({ trim: true })
  family?: string;

  @Prop({ trim: true })
  originalNote?: string;

  @Prop({ type: SchemaTypes.Mixed })
  status?: any;

  @Prop({ trim: true })
  type?: string;

  @Prop({ trim: true })
  subType?: string;

  @Prop({ trim: true })
  fileName?: string;

  @Prop({ type: SchemaTypes.Mixed })
  rawData?: any;

  createdAt?: Date;
  updatedAt?: Date;
}

export const CitizenSchema = SchemaFactory.createForClass(Citizen);
CitizenSchema.index({ fullName: 'text', village: 'text' });
CitizenSchema.index({ village: 1 });
CitizenSchema.index({ index: 1 });
CitizenSchema.index({ idx: 1 });
CitizenSchema.index({ createdAt: -1 });
