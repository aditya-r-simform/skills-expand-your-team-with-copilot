import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ActivitiesRepository } from './activities.repository';
import { AuthRepository } from '../auth/auth.repository';
import { CreateActivityDto } from './dto/create-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    private readonly activitiesRepository: ActivitiesRepository,
    private readonly authRepository: AuthRepository,
  ) {}

  async getActivities(filters?: {
    day?: string;
    startTime?: string;
    endTime?: string;
  }) {
    const activities = await this.activitiesRepository.findAll(filters);

    // Format response to match original API shape
    const result: Record<string, any> = {};
    for (const activity of activities) {
      const { name, participants, scheduleDays, ...rest } = activity;
      result[name] = {
        ...rest,
        schedule_details: {
          days: JSON.parse(scheduleDays),
          start_time: rest.startTime,
          end_time: rest.endTime,
        },
        participants: participants.map((p) => p.email),
      };
    }
    return result;
  }

  async getAvailableDays(): Promise<string[]> {
    return this.activitiesRepository.findAllDays();
  }

  async createActivity(dto: CreateActivityDto) {
    return this.activitiesRepository.create(dto);
  }

  async signupForActivity(
    activityName: string,
    email: string,
    teacherUsername: string,
  ) {
    // Validate teacher exists
    const teacher = await this.authRepository.findByUsername(teacherUsername);
    if (!teacher) {
      throw new UnauthorizedException('Invalid teacher credentials');
    }

    // Get the activity
    const activity = await this.activitiesRepository.findByName(activityName);
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    // Check capacity
    if (activity.participants.length >= activity.maxParticipants) {
      throw new BadRequestException('Activity is full');
    }

    // Check if student is already signed up
    const alreadySignedUp = activity.participants.some(
      (p) => p.email === email,
    );
    if (alreadySignedUp) {
      throw new BadRequestException('Already signed up for this activity');
    }

    await this.activitiesRepository.addParticipant(activity.id, email);
    return { message: `Signed up ${email} for ${activityName}` };
  }

  async unregisterFromActivity(
    activityName: string,
    email: string,
    teacherUsername: string,
  ) {
    // Validate teacher exists
    const teacher = await this.authRepository.findByUsername(teacherUsername);
    if (!teacher) {
      throw new UnauthorizedException('Invalid teacher credentials');
    }

    // Get the activity
    const activity = await this.activitiesRepository.findByName(activityName);
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    // Check if student is registered
    const isRegistered = activity.participants.some((p) => p.email === email);
    if (!isRegistered) {
      throw new BadRequestException('Not registered for this activity');
    }

    await this.activitiesRepository.removeParticipant(activity.id, email);
    return { message: `Unregistered ${email} from ${activityName}` };
  }
}
