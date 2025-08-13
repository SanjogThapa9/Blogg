import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';

@Injectable()
export class PostService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async createPost(title: string, content: string, userId: Types.ObjectId, createdBy: string) {
    const newPost = new this.postModel({ title, content, user_id: userId, created_by: createdBy });
    return await newPost.save();
  }

  async deletePost(postId: string, userId: Types.ObjectId, role: string) {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Only owner or admin can delete
    if (post.user_id.toString() !== userId.toString() && role !== 'admin') {
      throw new ForbiddenException('You do not have permission to delete this post');
    }

    return await this.postModel.findByIdAndDelete(postId);
  }
}
