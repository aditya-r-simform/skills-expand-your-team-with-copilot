import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { SignupActivityDto } from './dto/signup-activity.dto';

@Controller('activities')
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
