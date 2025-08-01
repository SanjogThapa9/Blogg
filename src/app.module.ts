import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { RatingModule } from './rating/rating.module';
@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/blogcms'),
    AuthModule,
    UserModule,
    PostModule,
    CommentModule,
    RatingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
