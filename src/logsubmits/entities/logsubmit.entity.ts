import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Mixed, Types } from 'mongoose';
import { Checkin } from 'src/checkin/entities/checkin.entity';
import { Place } from 'src/places/entities/place.entity';
import { Project } from 'src/projects/entities/project.entity';
import { Submit } from 'src/submits/entities/submit.entity';
import { User } from 'src/users/entities/user.entity';

export type LogsubmitDocument = Logsubmit & Document;
@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Logsubmit {
  @Prop({ type: Types.ObjectId, ref: Project.name, index: true })
  projectId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: Place.name, index: true })
  placeId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: User.name })
  ownerId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: Checkin.name, index: true })
  checkInId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Submit.name })
  submitId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: User.name })
  updatorId: Types.ObjectId;

  @Prop()
  timeCheckIn?: Date;

  @Prop()
  timeCheckOut?: Date;
  @Prop()
  location?: string;
  @Prop()
  region?: string;

  @Prop({ type: Object })
  // eslint-disable-next-line @typescript-eslint/ban-types
  data: Object;
  @Prop({ type: Object })
  // eslint-disable-next-line @typescript-eslint/ban-types
  oldData: Object;
  owner?: User;
  place?: Place;
  checkin?: Checkin;
}

export const LogsubmitSchema = SchemaFactory.createForClass(Logsubmit);
LogsubmitSchema.virtual('updator', {
  ref: User.name,
  localField: 'updatorId',
  foreignField: '_id',
  justOne: true,
});
LogsubmitSchema.virtual('place', {
  ref: Place.name,
  localField: 'placeId',
  foreignField: '_id',
  justOne: true,
});
LogsubmitSchema.virtual('checkin', {
  ref: Checkin.name,
  localField: 'checkInId',
  foreignField: '_id',
  justOne: true,
});
