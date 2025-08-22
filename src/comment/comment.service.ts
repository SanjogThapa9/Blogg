import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument, ReactionType } from './schemas/comment.schema';

@Injectable()
export class CommentService {
  constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument>) {}


  async createComment(
    text: string,
    userId: Types.ObjectId,
    postId: Types.ObjectId,
    parentCommentId?: Types.ObjectId,
  ) {
    if (!text?.trim()) {
      throw new BadRequestException('Comment text cannot be empty');
    }

    const comment = new this.commentModel({
      text: text.trim(),
      user_id: userId,
      post_id: postId,
      parentCommentId,
    });

    return await comment.save();
  }
  async appendToComment(
    commentId: string,
    userId: Types.ObjectId,
    role: string,
    appendText: string,
  ) {
    if (!appendText?.trim()) {
      throw new BadRequestException('Text to append cannot be empty');
    }

    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    if (comment.user_id.toString() !== userId.toString() && role !== 'admin') {
      throw new ForbiddenException('You cannot update this comment');
    }

   
    comment.text = appendText.trim();
    await comment.save();

    return {
      _id: comment._id,
      text: comment.text,
      user_id: comment.user_id,
      post_id: comment.post_id,
      reactions: comment.reactions,
      reactionDetails: comment.reactionDetails,
      
    };
  }

 async deleteComment(commentId: string, userId: Types.ObjectId, role: string) {
 
  const cleanCommentId = commentId.trim();

  const comment = await this.commentModel.findById(cleanCommentId);
  if (!comment) throw new NotFoundException('Comment not found');

  if (comment.user_id.toString() !== userId.toString() && role !== 'admin') {
    throw new ForbiddenException('You cannot delete this comment');
  }

  await this.commentModel.deleteMany({ parentCommentId: comment._id });

   await this.commentModel.findByIdAndDelete(cleanCommentId);

   return{messgae:"Your comment has been removed."}
}

  async reactToComment(commentId: string, userId: Types.ObjectId, reaction: ReactionType) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    const existing = comment.reactionDetails.find(r => r.userId.toString() === userId.toString());

    if (existing) {
      existing.reaction = reaction;
    } else {
      comment.reactionDetails.push({ userId, reaction });
    }

    const likes = comment.reactionDetails.filter(r => r.reaction === ReactionType.LIKE).length;
    const dislikes = comment.reactionDetails.filter(r => r.reaction === ReactionType.DISLIKE).length;

    comment.reactions = [];
    if (likes) comment.reactions.push(ReactionType.LIKE);
    if (dislikes) comment.reactions.push(ReactionType.DISLIKE);

    return await comment.save();
  }

  async getCommentsForPost(postId: string) {
    return this.commentModel.find({ post_id: postId }).sort({ createdAt: -1 });
  }
}
