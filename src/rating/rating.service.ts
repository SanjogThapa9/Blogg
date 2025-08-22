import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Rating, RatingDocument } from './schemas/rating.schema';

export interface RatingWithReplies {
  _id: Types.ObjectId;
  value: number;
  user_id: any;
  post_id: Types.ObjectId;
  parent_id?: Types.ObjectId | null;
  replies: RatingWithReplies[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class RatingService {
  constructor(@InjectModel(Rating.name) private ratingModel: Model<RatingDocument>) {}

  async createOrUpdateRating(
    value: number,
    userId: Types.ObjectId,
    postId: Types.ObjectId,
    parentId?: Types.ObjectId
  ) {
    if (!parentId) {
      const existingRating = await this.ratingModel.findOne({
        user_id: userId,
        post_id: postId,
        parent_id: null,
      });
      if (existingRating) {
        existingRating.value = value;
        return await existingRating.save();
      }
    }

    const rating = new this.ratingModel({
      value,
      user_id: userId,
      post_id: postId,
      parent_id: parentId ?? null,
    });
    return await rating.save();
  }

  async deleteRating(ratingId: string, userId: Types.ObjectId, role: string) {
    const rating = await this.ratingModel.findById(ratingId);
    if (!rating) throw new NotFoundException('Rating not found');

    if (rating.user_id.toString() !== userId.toString() && role !== 'admin') {
      throw new ForbiddenException('You do not have permission to delete this rating');
    }

    return await this.ratingModel.findByIdAndDelete(ratingId);
  }

  async getRatingsForPost(postId: Types.ObjectId): Promise<RatingWithReplies[]> {
    const ratings = await this.ratingModel
      .find({ post_id: postId })
      .populate('user_id', 'username')
      .lean();

    const ratingMap = new Map<string, RatingWithReplies>();

    ratings.forEach(r => {
      ratingMap.set(r._id.toString(), { ...r, replies: [] } as unknown as RatingWithReplies);
    });

    const rootRatings: RatingWithReplies[] = [];

    ratingMap.forEach(rating => {
      if (rating.parent_id) {
        const parent = ratingMap.get(rating.parent_id.toString());
        if (parent) parent.replies.push(rating);
      } else {
        rootRatings.push(rating);
      }
    });

    return rootRatings;
  }

  async replyToRating(
    value: number,
    userId: Types.ObjectId,
    postId: Types.ObjectId,
    parentId: Types.ObjectId
  ) {
    const parent = await this.ratingModel.findById(parentId);
    if (!parent) throw new NotFoundException('Parent rating not found');

    const reply = new this.ratingModel({
      value,
      user_id: userId,
      post_id: postId,
      parent_id: parentId,
    });
    return await reply.save();
  }
}
