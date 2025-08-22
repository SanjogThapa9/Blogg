import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PostService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async createPost(
    title: string,
    content: string,
    userId: Types.ObjectId,
    username: string,
    image?: string,
  ) {
    const newPost = new this.postModel({
      title,
      content,
      user_id: userId,
      created_by: username,
      image,
    });
    return await newPost.save();
  }

  async getAllPosts() {
    return await this.postModel.find();
  }

  async getPostById(id: string) {
    const post = await this.postModel.findById(id);
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async updatePost(
    postId: string,
    title: string,
    content: string,
    userId: Types.ObjectId,
    role: string,
    filename?: string,
  ) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    if (post.user_id.toString() !== userId.toString() && role !== 'admin') {
      throw new ForbiddenException('You do not have permission to update this post');
    }

    post.title = title || post.title;
    post.content = content || post.content;

    if (filename) {
      
      if (post.image) {
        const oldPath = path.join(__dirname, '..', '..', 'uploads', post.image);
        fs.unlink(oldPath, (err) => {
          if (err) console.warn('Failed to delete old image:', err.message);
        });
      }
      post.image = filename;
    }

    return await post.save();
  }

  async deletePost(postId: string, userId: Types.ObjectId, role: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    if (post.user_id.toString() !== userId.toString() && role !== 'admin') {
      throw new ForbiddenException('You do not have permission to delete this post');
    }

    
    if (post.image) {
      const imagePath = path.join(__dirname, '..', '..', 'uploads', post.image);
      fs.unlink(imagePath, (err) => {
        if (err) console.warn('Failed to delete image file:', err.message);
      });
    }
    await this.postModel.findByIdAndDelete(postId);

  
    return { message: 'Your post has been deleted' };
   
  }
}
