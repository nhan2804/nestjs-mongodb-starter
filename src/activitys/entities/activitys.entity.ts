import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { Document, Types, SchemaTypes } from 'mongoose';

export type ActivityDocument = Activity & Document;

@Schema({
  collection: 'activitys',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Activity {
  @IsString()
  @IsOptional()
  @Prop()
  name: string;

  @IsString()
  @Prop()
  app?: string;
  @IsString()
  @Prop({ default: 'WRITE' })
  mode?: string;
  @IsString()
  @Prop({ default: 'USER' })
  agent?: string;
  @Prop()
  module?: string;
  // @Transform(({ value }) => new Types.ObjectId(value))
  @Prop({ type: SchemaTypes.ObjectId })
  ownerId?: Types.ObjectId;

  @Prop({ type: Object })
  data?: object;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
