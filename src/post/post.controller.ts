import { Controller, Post as PostMethod, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGaurd } from 'src/guards/jwt.guard';
import { PostService } from './post.service';
import { Request } from 'express';
import { Types } from 'mongoose';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGaurd)
  @PostMethod('create')
  async createPost(
    @Body('title') title: string,
    @Body('content') content: string,
    @Req() req: Request
  ) {
    const user = req.user as any;
    return await this.postService.createPost(title, content, new Types.ObjectId(user._id), user.username);
  }

  @UseGuards(JwtAuthGaurd)
  @Delete(':id')
  async deletePost(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    return await this.postService.deletePost(id, new Types.ObjectId(user._id), user.role);
  }
}
