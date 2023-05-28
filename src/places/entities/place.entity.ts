import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { Document, SchemaTypes, Types } from 'mongoose';
import { BaseModel } from 'src/app/models/base.schema';
import { Project } from 'src/projects/entities/project.entity';
import { User } from 'src/users/entities/user.entity';

export type PlaceDocument = Place & Document;

@Schema({
  collection: 'places',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Place extends BaseModel {
  @IsOptional()
  @IsString()
  @Prop({ type: SchemaTypes.ObjectId, ref: Project.name })
  projectId: Types.ObjectId;
  @Transform(({ value }) =>
    Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : undefined,
  )
  @Prop({ type: [SchemaTypes.ObjectId], ref: User.name })
  qcId?: Types.ObjectId[];

  qc?: User[];
  @IsString()
  @IsOptional()
  @Prop()
  code?: string;
  @IsString()
  @IsOptional()
  @Prop()
  region?: string;

  @IsString()
  @IsOptional()
  @Prop()
  house_num?: string;
  @IsString()
  @IsOptional()
  @Prop()
  address?: string;
  @IsString()
  @IsOptional()
  @Prop()
  ward?: string;
  @IsString()
  @IsOptional()
  @Prop()
  district?: string;
  @IsString()
  @IsOptional()
  @Prop()
  province?: string;
  @IsString()
  @IsOptional()
  @Prop()
  schedule?: Date;
  @IsString()
  @IsOptional()
  @Prop()
  type?: string;

  @IsString()
  @IsOptional()
  @Prop()
  timeDone?: Date;

  @IsString()
  @IsOptional()
  @Prop()
  timeCheckIn?: Date;
  @IsString()
  @IsOptional()
  @Prop()
  timeCheckOut?: Date;
  // @IsString()
  // @Prop({ required: true })
  // share: SHARE_LIST;
}

export const PlaceSchema = SchemaFactory.createForClass(Place);
PlaceSchema.virtual('qc', {
  ref: User.name,
  localField: 'qcId',
  foreignField: '_id',
  // justOne: true,
});
