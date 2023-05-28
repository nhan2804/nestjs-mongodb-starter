import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Mixed, Types } from 'mongoose';
import { Place } from 'src/places/entities/place.entity';
import { Project } from 'src/projects/entities/project.entity';
import { User } from 'src/users/entities/user.entity';

export type CheckinDocument = Checkin & Document;
@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Checkin {
  @Prop({ type: Types.ObjectId, ref: Project.name })
  projectId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: Place.name })
  placeId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: User.name })
  ownerId: Types.ObjectId;

  @Prop()
  timeCheckIn?: Date;

  @Prop()
  imageCheckin?: string;
  @Prop()
  imageCheckOut?: string;
  @Prop()
  image1Checkin?: string;

  @Prop()
  timeCheckOut?: Date;
  @Prop()
  location?: string;
  @Prop()
  locationCheckIn?: string;
  @Prop()
  locationCheckOut?: string;
  owner?: User;
  place?: Place;
}

export const CheckinSchema = SchemaFactory.createForClass(Checkin);
CheckinSchema.virtual('owner', {
  ref: User.name,
  localField: 'ownerId',
  foreignField: '_id',
  justOne: true,
});
CheckinSchema.virtual('place', {
  ref: Place.name,
  localField: 'placeId',
  foreignField: '_id',
  justOne: true,
});
