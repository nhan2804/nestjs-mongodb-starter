import { Prop, Schema } from '@nestjs/mongoose';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { Document, Mixed, Types } from 'mongoose';

export type BaseDocument = BaseModel & Document;

@Schema()
export class BaseModel {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  // @Prop({ required: true })
  xid?: string; //Uniqe

  @IsString()
  @IsOptional()
  @Prop()
  name?: string;

  @IsString()
  @IsOptional()
  @Prop()
  description: string;

  @IsString({ each: true })
  @IsOptional()
  @Prop({ default: undefined })
  tags?: [string];

  @IsOptional()
  @Prop({ type: Object })
  props: {};
}
