// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, HttpException, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register.dto';
import { AuthPayloadDto } from './dto/auth.dto';
import { LocalGuard } from 'src/guards/loacl.guard';
import { JwtAuthGaurd } from 'src/guards/jwt.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() payload: RegisterUserDto) {  // <-- changed DTO here
    const user = await this.authService.register(payload);
    return { message: 'User registered successfully', user };
  }

  @Post('login')
  @UseGuards(LocalGuard)
  async login(@Body() authPayload: AuthPayloadDto) {
    const user = await this.authService.validateUser(authPayload);
    if (!user) {
      throw new HttpException('Invalid credentials', 401);
    }
    return this.authService.login(user);
  }

  @Get('status')
  @UseGuards(JwtAuthGaurd)
  status(@Req() req: Request) {
    return { user: req.user };
  }
}
