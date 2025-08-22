import {
  Controller,
  Post as PostMethod,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  Put,
  Get,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { Request } from 'express';
import { Types } from 'mongoose';
import { CommentService } from './comment.service';
import { ReactionType } from './schemas/comment.schema';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtAuthGuard)
  @PostMethod('create')
  async createComment(
    @Body('text') text: string,
    @Body('post_id') postId: string,
    @Body('parentCommentId') parentCommentId: string,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.commentService.createComment(
      text,
      new Types.ObjectId(user.sub),
      new Types.ObjectId(postId),
      parentCommentId ? new Types.ObjectId(parentCommentId) : undefined,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/append')
  async appendToComment(
    @Param('id') id: string,
    @Body('text') text: string, 
    @Req() req: Request,
  ) {
    console.log('Received text:', text);
    const user = req.user as any;
    return this.commentService.appendToComment(
      id,
      new Types.ObjectId(user.sub),
      user.role,
      text,  
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteComment(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    return this.commentService.deleteComment(id, new Types.ObjectId(user.sub), user.role);
  }

  @UseGuards(JwtAuthGuard)
  @PostMethod('react')
  async reactToComment(
    @Body('commentId') commentId: string,
    @Body('reaction') reaction: ReactionType,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.commentService.reactToComment(commentId, new Types.ObjectId(user.sub), reaction);
  }

  
  @Get('post/:postId')
  async getComments(@Param('postId') postId: string) {
    return this.commentService.getCommentsForPost(postId);
  }
}
