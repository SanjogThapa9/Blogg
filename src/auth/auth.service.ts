
import { Injectable, HttpException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from '../user/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from "./dto/register.dto";
import { AuthPayloadDto } from "./dto/auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async register(payload: RegisterUserDto) {  
    const existing = await this.userModel.findOne({ username: payload.username });
    if (existing) {
      throw new HttpException('Username already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const newUser = new this.userModel({
      username: payload.username,
      email: payload.email,
      role: payload.role,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const { password, ...result } = user.toObject();
    return result;
  }

  async validateUser({ username, password }: AuthPayloadDto) {
    const user = await this.userModel.findOne({ username });
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    const { password: _, ...result } = user.toObject();
    return result;
  }

  login(user: any) {
    const payload = { username: user.username, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
