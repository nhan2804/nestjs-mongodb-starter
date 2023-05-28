import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional, IsString } from 'class-validator';
import { Document } from 'mongoose';

export type DepartmentDocument = Department & Document;

@Schema({
  collection: 'tickets',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Department {
  @IsString()
  @IsOptional()
  @Prop()
  name: string;

  @IsOptional()
  @IsString()
  @Prop()
  avatar?: string;
  
                  

                  @Prop()
                  note: string;
                  

              

                  

                  @Prop()
                  status: string;
                  

              
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
