import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';

@Injectable()
export class CommentService {
  constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument>) {}

  async createComment(text: string, userId: Types.ObjectId, postId: Types.ObjectId) {
    const comment = new this.commentModel({ text, user_id: userId, post_id: postId });
    return await comment.save();
  }

  async deleteComment(commentId: string, userId: Types.ObjectId, role: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.user_id.toString() !== userId.toString() && role !== 'admin') {
      throw new ForbiddenException('You do not have permission to delete this comment');
    }

    return await this.commentModel.findByIdAndDelete(commentId);
  }
}
