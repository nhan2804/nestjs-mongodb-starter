import { IsString, MinLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class ChangePasswordDto {
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Transform(({ value }) => value.trim())
  oldPassword: string;
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Transform(({ value }) => value.trim())
  newPassword: string;
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Transform(({ value }) => value.trim())
  reNewPassword: string;
}
