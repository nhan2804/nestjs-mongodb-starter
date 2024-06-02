import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional, IsString } from 'class-validator';
import { Document } from 'mongoose';

export type __name__(pascalCase)Document = __name__(pascalCase) & Document;

@Schema({
  collection: '__name__s',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class __name__(pascalCase) {
  @IsString()
  @IsOptional()
  @Prop()
  name: string;

  @IsOptional()
  @IsString()
  @Prop()
  avatar?: string;
  __column-table-be__
}

export const __name__(pascalCase)Schema = SchemaFactory.createForClass(__name__(pascalCase));
