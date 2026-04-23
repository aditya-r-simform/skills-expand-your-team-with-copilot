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

  /**
   * Gets activities and optionally filters them by schedule day and time range.
   *
   * @param filters - Optional activity filter criteria.
   * @param filters.day - Day to filter scheduled activities by.
   * @param filters.startTime - Start time (inclusive) for filtering.
   * @param filters.endTime - End time (inclusive) for filtering.
   * @returns A map of activity names to activity details formatted for API responses.
   * @throws {SyntaxError} When persisted `scheduleDays` data cannot be parsed as JSON.
   */
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

  /**
   * Gets all distinct days that have at least one scheduled activity.
   *
   * @returns A list of available activity days.
   */
  async getAvailableDays(): Promise<string[]> {
    return this.activitiesRepository.findAllDays();
  }

  /**
   * Creates a new activity.
   *
   * @param dto - Activity payload used to create a new activity record.
   * @returns The created activity record.
   */
  async createActivity(dto: CreateActivityDto) {
    return this.activitiesRepository.create(dto);
  }

  /**
   * Registers a student for an activity.
   *
   * @param activityName - Name of the activity to sign up for.
   * @param email - Student email to register.
   * @param teacherUsername - Teacher username used to authorize the operation.
   * @returns A confirmation message describing the successful signup.
   * @throws {UnauthorizedException} When the provided teacher credentials are invalid.
   * @throws {NotFoundException} When the activity does not exist.
   * @throws {BadRequestException} When the activity is full or the student is already registered.
   */
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

  /**
   * Unregisters a student from an activity.
   *
   * @param activityName - Name of the activity to unregister from.
   * @param email - Student email to remove from the activity.
   * @param teacherUsername - Teacher username used to authorize the operation.
   * @returns A confirmation message describing the successful unregistration.
   * @throws {UnauthorizedException} When the provided teacher credentials are invalid.
   * @throws {NotFoundException} When the activity does not exist.
   * @throws {BadRequestException} When the student is not registered for the activity.
   */
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
