import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PersonalInfo } from './schemas/personal-info.schema';

@Injectable()
export class InfoServiceService {
  constructor(@InjectModel(PersonalInfo.name) private infoModel: Model<PersonalInfo>) {}

  async getPersonalInfo(userId: number) {
    try {
      let result = await this.infoModel.findOne({ userId }).exec();

      if (!result) {
        console.log(
          `[InfoService] No info found for userId ${userId}. Initializing empty profile.`,
        );
        const emptyData = {
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
        };

        result = await new this.infoModel(emptyData).save();
      }

      return result;
    } catch (error) {
      console.error(`[InfoService] Error in getPersonalInfo for userId ${userId}:`, error);
      throw error;
    }
  }

  async updatePersonalInfo(userId: number, data: any) {
    // Remove _id and __v from data if they exist to avoid MongoDB errors
    const { _id, __v, ...updateData } = data;

    // Check if updateData is empty
    if (Object.keys(updateData).length === 0) {
      return this.infoModel.findOne({ userId }).exec();
    }

    return this.infoModel
      .findOneAndUpdate(
        { userId },
        { $set: { ...updateData } }, // Do not overwrite userId
        { new: true, upsert: true },
      )
      .exec();
  }
}
