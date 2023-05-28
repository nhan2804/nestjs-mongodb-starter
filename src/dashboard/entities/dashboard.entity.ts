import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { Document, SchemaTypes, Types } from 'mongoose';
import { GroupQuestion } from 'src/group-question/entities/group-question.entity';
import { GroupUser } from 'src/group-users/entities/group-user.entity';
import { Option } from 'src/options/entities/option.entity';
import { Project } from 'src/projects/entities/project.entity';
import { User } from 'src/users/entities/user.entity';

export type DashboardDocument = Dashboard & Document;
@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Dashboard {
  @Prop({ type: Types.ObjectId, ref: Option.name })
  optionId: Types.ObjectId;
  @Prop({ type: [Types.ObjectId], ref: Option.name })
  optionIds: Types.ObjectId[];
  @Prop()
  name: string;
  @Prop()
  chartKind: string;
  @Prop()
  chartType: string;
  @Prop()
  description: string;
  @Prop()
  position?: number;
  @Prop({ type: Types.ObjectId, ref: Project.name })
  projectId: Types.ObjectId;
}

export const DashboardSchema = SchemaFactory.createForClass(Dashboard);
// DashboardSchema.virtual('except', {
//   ref: GroupUser.name,
//   localField: 'exceptIdsGroup',
//   foreignField: '_id',
//   // justOne: true,
// });
