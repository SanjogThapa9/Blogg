import {
  Controller,
  Post as PostMethod,
  Delete,
  Get,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt.guard';
import { RolesGuard } from 'src/guards/rolesguard';
import { PostService } from './post.service';
import { Request } from 'express';
import { Types } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard, new RolesGuard('admin'))
  @PostMethod('create')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(new Error('Only image files are allowed!'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async createPost(
    @Body('title') title: string,
    @Body('content') content: string,
    @UploadedFile() image: Express.Multer.File,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.postService.createPost(
      title,
      content,
      new Types.ObjectId(user.sub),
      user.username,
      image?.filename,
    );
  }

  @Get()
  async getAllPosts() {
    return this.postService.getAllPosts();
  }

  @Get(':id')
  async getPostById(@Param('id') id: string) {
    return this.postService.getPostById(id);
  }

  @UseGuards(JwtAuthGuard, new RolesGuard('admin'))
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(new Error('Only image files are allowed!'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async updatePost(
    @Param('id') id: string,
    @Body('title') title: string,
    @Body('content') content: string,
    @UploadedFile() image: Express.Multer.File,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.postService.updatePost(
      id,
      title,
      content,
      new Types.ObjectId(user.sub),
      user.role,
      image?.filename,
    );
  }

  @UseGuards(JwtAuthGuard, new RolesGuard('admin'))
  @Delete(':id')
  async deletePost(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    return this.postService.deletePost(id, new Types.ObjectId(user.sub), user.role);
  }
}
