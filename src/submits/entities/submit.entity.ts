import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Mixed, Types } from 'mongoose';
import { Checkin } from 'src/checkin/entities/checkin.entity';
import { Place } from 'src/places/entities/place.entity';
import { Project } from 'src/projects/entities/project.entity';
import { User } from 'src/users/entities/user.entity';

export type SubmitDocument = Submit & Document;
@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Submit {
  @Prop({ type: Types.ObjectId, ref: Project.name, index: true })
  projectId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: Place.name, index: true })
  placeId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: User.name, index: true })
  ownerId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: Checkin.name, index: true })
  checkInId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name })
  updatorId?: Types.ObjectId;
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
  owner?: User;
  place?: Place;
  checkin?: Checkin;
}

export const SubmitSchema = SchemaFactory.createForClass(Submit);
SubmitSchema.virtual('owner', {
  ref: User.name,
  localField: 'ownerId',
  foreignField: '_id',
  justOne: true,
});
SubmitSchema.virtual('place', {
  ref: Place.name,
  localField: 'placeId',
  foreignField: '_id',
  justOne: true,
});
SubmitSchema.virtual('checkin', {
  ref: Checkin.name,
  localField: 'checkInId',
  foreignField: '_id',
  justOne: true,
});
