import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Username is required' })
  username: string;

  @IsEmail({}, { message: 'Email must be valid' })
  email: string;

  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsEnum(['admin', 'user'], { message: 'Role must be either admin or user' })
  role: 'admin' | 'user';
}
