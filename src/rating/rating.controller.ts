import { Controller, Post as PostMethod, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGaurd } from 'src/guards/jwt.guard';
import { RatingService } from './rating.service';
import { Request } from 'express';
import { Types } from 'mongoose';

@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @UseGuards(JwtAuthGaurd)
  @PostMethod('create')
  async createRating(
    @Body('value') value: number,
    @Body('post_id') postId: string,
    @Req() req: Request
  ) {
    const user = req.user as any;
    return await this.ratingService.createRating(
      value,
      new Types.ObjectId(user._id),
      new Types.ObjectId(postId)
    );
  }

  @UseGuards(JwtAuthGaurd)
  @Delete(':id')
  async deleteRating(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    return await this.ratingService.deleteRating(id, new Types.ObjectId(user._id), user.role);
  }
}
