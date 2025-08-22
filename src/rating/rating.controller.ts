import {
  Controller,
  Post as PostMethod,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  Get,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { RatingService, RatingWithReplies } from './rating.service';
import { Request } from 'express';
import { Types } from 'mongoose';

@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  // Helper to safely get user
  private getUser(req: Request) {
    const user = req.user as any;
    if (!user || !user._id) throw new UnauthorizedException('User not authenticated');
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @PostMethod('create')
  async createOrUpdateRating(
    @Body('value') value: number,
    @Body('post_id') postId: string,
    @Req() req: Request,
    @Body('parent_id') parentId?: string
  ) {
    const user = this.getUser(req);

    return await this.ratingService.createOrUpdateRating(
      value,
      new Types.ObjectId(user._id),
      new Types.ObjectId(postId),
      parentId ? new Types.ObjectId(parentId) : undefined
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteRating(@Param('id') id: string, @Req() req: Request) {
    const user = this.getUser(req);

    return await this.ratingService.deleteRating(
      id,
      new Types.ObjectId(user._id),
      user.role
    );
  }

  @Get('post/:postId')
  async getRatingsForPost(@Param('postId') postId: string): Promise<RatingWithReplies[]> {
    return await this.ratingService.getRatingsForPost(new Types.ObjectId(postId));
  }

  @UseGuards(JwtAuthGuard)
  @PostMethod('reply')
  async replyToRating(
    @Body('value') value: number,
    @Body('post_id') postId: string,
    @Body('parent_id') parentId: string,
    @Req() req: Request
  ) {
    const user = this.getUser(req);

    if (!parentId) throw new BadRequestException('Parent ID is required to reply');

    return await this.ratingService.replyToRating(
      value,
      new Types.ObjectId(user._id),
      new Types.ObjectId(postId),
      new Types.ObjectId(parentId)
    );
  }
}
