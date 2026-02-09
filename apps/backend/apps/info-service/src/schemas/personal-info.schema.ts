import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PersonalInfoDocument = HydratedDocument<PersonalInfo>;

@Schema()
export class PersonalInfo {
  @Prop({ required: true, unique: true, index: true })
  userId: number;

  @Prop()
  name: string;

  @Prop()
  role: string;

  @Prop()
  bio: string;

  @Prop()
  phone: string;

  @Prop()
  location: string;

  @Prop()
  email: string;

  @Prop()
  github: string;

  @Prop()
  linkedin: string;

  @Prop()
  website: string;
  
  @Prop()
  cvUrl: string;

  @Prop([{
    title: String,
    company: String,
    startDate: String,
    endDate: String,
    description: String,
    current: Boolean
  }])
  career: {
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
    current: boolean;
  }[];
}

export const PersonalInfoSchema = SchemaFactory.createForClass(PersonalInfo);
