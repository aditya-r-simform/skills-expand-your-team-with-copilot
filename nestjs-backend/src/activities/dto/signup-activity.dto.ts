import { IsEmail, IsString } from 'class-validator';

export class SignupActivityDto {
  @IsEmail()
  email: string;

  @IsString()
  teacherUsername: string;
}
