import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional, IsString } from 'class-validator';
import { Document,Types ,SchemaTypes} from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({
  collection: 'projects',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Project {
  @IsString()
  @IsOptional()
  @Prop()
  name: string;

  // @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  // owner: Types.ObjectId;
  @IsOptional()
  @IsString()
  @Prop()
  avatar?: string;
  
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
