import { Controller, Post as PostMethod, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGaurd } from 'src/guards/jwt.guard';
import { CommentService } from './comment.service';
import { Request } from 'express';
import { Types } from 'mongoose';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtAuthGaurd)
  @PostMethod('create')
  async createComment(
    @Body('text') text: string,
    @Body('post_id') postId: string,
    @Req() req: Request
  ) {
    const user = req.user as any;
    return await this.commentService.createComment(
      text,
      new Types.ObjectId(user._id),
      new Types.ObjectId(postId)
    );
  }

  @UseGuards(JwtAuthGaurd)
  @Delete(':id')
  async deleteComment(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    return await this.commentService.deleteComment(id, new Types.ObjectId(user._id), user.role);
  }
}
