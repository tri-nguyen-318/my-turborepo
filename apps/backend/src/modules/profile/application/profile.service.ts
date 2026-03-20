import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PersonalInfo } from '../domain/schemas/personal-info.schema';

const ALLOWED_EMAIL = 'nguyenhuutri31081999nht@gmail.com';

@Injectable()
export class ProfileService {
  constructor(@InjectModel(PersonalInfo.name) private readonly infoModel: Model<PersonalInfo>) {}

  async getPersonalInfo(userId: number) {
    let result = await this.infoModel.findOne({ userId }).exec();

    if (!result) {
      result = await new this.infoModel({
        userId,
        name: '',
        role: '',
        bio: '',
        location: '',
        phone: '',
        email: '',
        github: '',
        linkedin: '',
        website: '',
        cvUrl: '',
      }).save();
    }

    return result;
  }

  async updatePersonalInfo(userEmail: string, userId: number, data: any) {
    if (userEmail !== ALLOWED_EMAIL) {
      throw new ForbiddenException('You do not have permission to update personal info.');
    }

    const { _id, __v, ...updateData } = data;

    if (Object.keys(updateData).length === 0) {
      return this.infoModel.findOne({ userId }).exec();
    }

    return this.infoModel
      .findOneAndUpdate({ userId }, { $set: updateData }, { new: true, upsert: true })
      .exec();
  }
}
