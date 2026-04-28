import {
  IsString,
  IsInt,
  IsArray,
  Min,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  Matches,
} from 'class-validator';

/**
 * DTO for creating a new activity.
 *
 * Applied per nestjs.instructions.md best practices:
 * - All fields validated with class-validator decorators
 * - Separate DTOs per operation (create vs update)
 * - @IsNotEmpty() added to all required string fields
 */
export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @IsString()
  @IsNotEmpty()
  schedule: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  scheduleDays: string[];

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime must be in HH:MM format',
  })
  startTime: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'endTime must be in HH:MM format',
  })
  endTime: string;

  @IsInt()
  @Min(1)
  maxParticipants: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  participants?: string[];
}
