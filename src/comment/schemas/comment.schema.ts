import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommentDocument = Comment & Document;

export enum ReactionType {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true })
  text: string; 

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  post_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Comment' })
  parentCommentId?: Types.ObjectId; 

  @Prop({ type: [{ type: String, enum: ReactionType }], default: [] })
  reactions: ReactionType[];

  @Prop({ type: [{ userId: Types.ObjectId, reaction: String }] })
  reactionDetails: { userId: Types.ObjectId; reaction: ReactionType }[]; 
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
