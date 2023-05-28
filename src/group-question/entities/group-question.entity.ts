import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Project } from 'src/projects/entities/project.entity';
import { User } from 'src/users/entities/user.entity';

export type GroupQuestionDocument = GroupQuestion & Document;
@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class GroupQuestion {
  @Prop()
  name: string;
  @Prop()
  layout?: string;
  @Prop()
  type: string;
  @Prop()
  description: string;
  @Prop({ type: Types.ObjectId, ref: Project.name })
  projectId: Types.ObjectId;
  @Prop()
  position?: number;
}

export const GroupQuestionSchema = SchemaFactory.createForClass(GroupQuestion);
GroupQuestionSchema.virtual('except', {
  ref: User.name,
  localField: 'exceptIds',
  foreignField: '_id',
  // justOne: true,
});
