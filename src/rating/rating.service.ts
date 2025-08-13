import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Rating, RatingDocument } from './schemas/rating.schema';

@Injectable()
export class RatingService {
  constructor(@InjectModel(Rating.name) private ratingModel: Model<RatingDocument>) {}

  async createRating(value: number, userId: Types.ObjectId, postId: Types.ObjectId) {
    const existingRating = await this.ratingModel.findOne({ user_id: userId, post_id: postId });
    if (existingRating) {
      // Update rating if already exists
      existingRating.value = value;
      return await existingRating.save();
    }

    const rating = new this.ratingModel({ value, user_id: userId, post_id: postId });
    return await rating.save();
  }

  async deleteRating(ratingId: string, userId: Types.ObjectId, role: string) {
    const rating = await this.ratingModel.findById(ratingId);
    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    if (rating.user_id.toString() !== userId.toString() && role !== 'admin') {
      throw new ForbiddenException('You do not have permission to delete this rating');
    }

    return await this.ratingModel.findByIdAndDelete(ratingId);
  }
}
