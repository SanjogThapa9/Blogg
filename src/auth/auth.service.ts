import { Injectable, HttpException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../user/schemas/user.schema';
import { RegisterUserDto } from './dto/register.dto';
import { AuthPayloadDto } from './dto/auth.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  refreshAccessToken(refreshToken: any) {
    throw new Error('Method not implemented.');
  }
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async register(payload: RegisterUserDto) {
    const existing = await this.userModel.findOne({ username: payload.username });
    if (existing) throw new HttpException('Username already exists', 409);

    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const newUser = new this.userModel({
      username: payload.username,
      email: payload.email,
      role: payload.role,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const { password, ...result } = user.toObject();

  
    const roleLabel = result.role === 'admin' ? 'Admin' : 'User';

    return {
      message: `${roleLabel} registered successfully`,
      user: result,
    };
  }

  async validateUser({ username, password }: AuthPayloadDto) {
    const user = await this.userModel.findOne({ username });
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    const { password: _, ...result } = user.toObject();
    return result;
  }

  async login(user: any) {
    const tokenId = Math.random().toString(36).substring(2) + Date.now().toString(36);

    const payload = {
      username: user.username,
      sub: user._id,
      role: user.role,
      tokenId,
      sessionId: tokenId,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET')!,
      expiresIn: this.configService.get<string>('JWT_EXPIRATION') || '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET')!,
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userModel.findByIdAndUpdate(user._id, {
      refreshToken: hashedRefreshToken,
      currentTokenId: tokenId,
      lastLogin: new Date(),
    });

    return {
      accessToken,
      refreshToken,
      tokenId,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload: any = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET')!,
      });

      const user = await this.userModel.findById(payload.sub);
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.login({ username: payload.username, _id: payload.sub, role: payload.role });
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      refreshToken: null,
      currentTokenId: null,
      lastLogout: new Date(),
    });
    return { message: 'Logged out successfully. Token is now invalid.' };
  }

  async validateToken(tokenId: string, userId: string): Promise<boolean> {
    const user = await this.userModel.findById(userId);

    if (!user || !user.currentTokenId) {
      return false;
    }

    return user.currentTokenId === tokenId;
  }

  async invalidateUserSessions(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      currentTokenId: null,
      refreshToken: null,
    });
  }
}
