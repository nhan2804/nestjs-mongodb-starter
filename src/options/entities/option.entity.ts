import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, SchemaTypes, Types } from 'mongoose';
import { GroupQuestion } from 'src/group-question/entities/group-question.entity';
import { GroupUser } from 'src/group-users/entities/group-user.entity';
import { Project } from 'src/projects/entities/project.entity';
import { User } from 'src/users/entities/user.entity';

export type OptionDocument = Option & Document;
@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Option {
  @Transform(({ value }) =>
    Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : undefined,
  )
  @Prop({ type: [SchemaTypes.ObjectId], ref: User.name })
  exceptIds?: Types.ObjectId[];
  @Prop({ type: [SchemaTypes.ObjectId], ref: GroupUser.name })
  exceptIdsGroup?: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: GroupQuestion.name })
  groupId: Types.ObjectId;

  except?: User[];
  @Prop()
  name: string;
  @Prop()
  layout?: string;
  @Prop()
  required: boolean;
  @Prop()
  type: string;
  @Prop({ type: Object })
  // eslint-disable-next-line @typescript-eslint/ban-types
  option: Object;
  @Prop()
  kind: string;
  @Prop()
  description: string;
  @Prop()
  postition?: number;
  @Prop({ type: Types.ObjectId, ref: Project.name })
  projectId: Types.ObjectId;
}

export const OptionSchema = SchemaFactory.createForClass(Option);
OptionSchema.virtual('except', {
  ref: GroupUser.name,
  localField: 'exceptIdsGroup',
  foreignField: '_id',
  // justOne: true,
});
