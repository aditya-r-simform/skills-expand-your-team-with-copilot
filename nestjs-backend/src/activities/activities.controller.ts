import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { SignupActivityDto } from './dto/signup-activity.dto';

/**
 * ActivitiesController — REST endpoints for the activities domain.
 *
 * Applied per nestjs.instructions.md + api-architect agent:
 * - Controller is thin: all business logic lives in ActivitiesService
 * - @UsePipes(ValidationPipe) with whitelist strips unknown properties
 * - Three-layer separation: Controller → Service → Repository
 */
@Controller('activities')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  getActivities(
    @Query('day') day?: string,
    @Query('start_time') startTime?: string,
    @Query('end_time') endTime?: string,
  ) {
    return this.activitiesService.getActivities({ day, startTime, endTime });
  }

  @Get('days')
  getAvailableDays() {
    return this.activitiesService.getAvailableDays();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createActivity(@Body() dto: CreateActivityDto) {
    return this.activitiesService.createActivity(dto);
  }

  @Post(':activityName/signup')
  @HttpCode(HttpStatus.OK)
  signupForActivity(
    @Param('activityName') activityName: string,
    @Body() dto: SignupActivityDto,
  ) {
    return this.activitiesService.signupForActivity(
      activityName,
      dto.email,
      dto.teacherUsername,
    );
  }

  @Post(':activityName/unregister')
  @HttpCode(HttpStatus.OK)
  unregisterFromActivity(
    @Param('activityName') activityName: string,
    @Body() dto: SignupActivityDto,
  ) {
    return this.activitiesService.unregisterFromActivity(
      activityName,
      dto.email,
      dto.teacherUsername,
    );
  }
}
