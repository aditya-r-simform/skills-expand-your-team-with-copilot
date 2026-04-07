import {
  IsString,
  IsInt,
  IsArray,
  Min,
  IsOptional,
} from 'class-validator';

export class CreateActivityDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  schedule: string;

  @IsArray()
  @IsString({ each: true })
  scheduleDays: string[];

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsInt()
  @Min(1)
  maxParticipants: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  participants?: string[];
}
