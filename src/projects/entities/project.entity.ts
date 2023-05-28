import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Document, SchemaTypes, Types } from 'mongoose';
import { BaseModel } from 'src/app/models/base.schema';
import { User } from 'src/users/entities/user.entity';

export type ProjectDocument = Project & Document;

enum SHARE_LIST {
  Private = 'Private',
  Shared = 'Shared',
  Public = 'Public',
}

@Schema({ collection: 'projects', timestamps: true })
export class Project extends BaseModel {
  @IsString()
  @IsOptional()
  @Prop()
  title: string;

  @IsOptional()
  @IsString()
  @Prop()
  avatar?: string;

  @IsOptional()
  @IsString()
  @Prop()
  bgcover?: string;

  @IsOptional()
  @IsString()
  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  owner: Types.ObjectId;
  @IsOptional()
  @IsArray()
  @Prop()
  userIds?: [];

  // @IsString()
  // @Prop({ required: true })
  // share: SHARE_LIST;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
