import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Mixed, Types } from 'mongoose';
import { Project } from 'src/projects/entities/projects.entity';
import { User } from 'src/users/entities/user.entity';

export type UploadDocument = Upload & Document;
@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Upload {
  @Prop({ type: Types.ObjectId, ref: Project.name })
  projectId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: User.name })
  ownerId: Types.ObjectId;
  @Prop()
  key?: string;

  @Prop()
  url?: string;
  @Prop()
  urlPublic?: string;
  @Prop()
  name?: string;
}

export const UploadSchema = SchemaFactory.createForClass(Upload);
UploadSchema.virtual('owner', {
  ref: User.name,
  localField: 'ownerId',
  foreignField: '_id',
  justOne: true,
});
