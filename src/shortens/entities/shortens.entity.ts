import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional, IsString } from 'class-validator';
import { Document, Types, SchemaTypes } from 'mongoose';

export type ShortenDocument = Shorten & Document;

@Schema({
  collection: 'shortens',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Shorten {
  @IsString()
  @IsOptional()
  @Prop()
  name: string;
  @Prop()
  code: string;
  @Prop()
  desc: string;
  @Prop()
  originLink: string;
  @Prop()
  link: string;
  // @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  // owner: Types.ObjectId;
  @IsOptional()
  @IsString()
  @Prop()
  image?: string;
}

export const ShortenSchema = SchemaFactory.createForClass(Shorten);
