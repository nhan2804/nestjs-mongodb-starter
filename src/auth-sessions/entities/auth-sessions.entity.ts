import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { Document, Types, SchemaTypes } from 'mongoose';
import { User } from 'src/users/entities/user.entity';

export type AuthSessionDocument = AuthSession & Document;

@Schema({
  collection: 'auth-sessions',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class AuthSession {
  @Prop()
  ip: string;
  @Prop()
  authSessionKey: string;
  @Prop()
  deviceName?: string;
  @Exclude({ toPlainOnly: true })
  @Prop()
  accessToken?: string;
  @Prop({ default: 'WEB' })
  type?: string;

  @IsString()
  @Prop()
  userAgent?: string;
  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  ownerId: Types.ObjectId;
}

export const AuthSessionSchema = SchemaFactory.createForClass(AuthSession);
