import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Project } from 'src/projects/entities/project.entity';
import { User } from 'src/users/entities/user.entity';

export type GroupUserDocument = GroupUser & Document;
@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class GroupUser {
  @Prop({ type: [SchemaTypes.ObjectId], ref: User.name })
  usersId?: Types.ObjectId[];
  @Prop()
  name: string;
  @Prop({ type: Types.ObjectId, ref: Project.name, index: true })
  projectId: Types.ObjectId;
}

export const GroupUserSchema = SchemaFactory.createForClass(GroupUser);
GroupUserSchema.virtual('users', {
  ref: User.name,
  localField: 'usersId',
  foreignField: '_id',
  // justOne: true,
});
