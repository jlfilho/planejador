import { IsBoolean, IsEmail, IsString, MinLength } from 'class-validator';
export class RegisterDto { @IsEmail() email!: string; @IsString() @MinLength(12) password!: string; }
export class LoginDto { @IsEmail() email!: string; @IsString() password!: string; }
export class UpdateUserStatusDto { @IsBoolean() active!: boolean; }
