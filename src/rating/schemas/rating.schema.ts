import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RatingDocument = Rating & Document;

@Schema({ timestamps: true })
export class Rating {
  @Prop({ required: true })
  value: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  post_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Rating', default: null }) 
  parent_id: Types.ObjectId | null;;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
