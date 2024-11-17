import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional, IsString } from 'class-validator';
import { Document,Types ,SchemaTypes} from 'mongoose';

export type ActivityDocument = Activity & Document;

@Schema({
  collection: 'activitys',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Activity {
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

export const ActivitySchema = SchemaFactory.createForClass(Activity);
