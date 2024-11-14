import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Project } from 'src/projects/entities/project.entity';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ trim: true, index: true })
  username: string;
  @Prop({})
  fullName: string;
  @Prop()
  ssoId?: string;
  @Prop()
  ssoEmail?: string;
  @Prop()
  password: string;
  @Prop({ default: 'USER' })
  type: string;
  @Prop()
  mode?: string;
  @Prop()
  avatar?: string;
  @Prop({ trim: true })
  passwordRaw?: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'projects' })
  projectId: Types.ObjectId;
  @Prop({ default: () => Math.random() })
  otp?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ username: 1 }, { unique: true });
