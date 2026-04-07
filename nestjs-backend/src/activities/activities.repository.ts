import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';

@Injectable()
export class ActivitiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: {
    day?: string;
    startTime?: string;
    endTime?: string;
  }) {
    const activities = await this.prisma.activity.findMany({
      include: { participants: true },
    });

    if (!filters || (!filters.day && !filters.startTime && !filters.endTime)) {
      return activities;
    }

    return activities.filter((activity) => {
      const days: string[] = JSON.parse(activity.scheduleDays);

      if (filters.day && !days.includes(filters.day)) {
        return false;
      }
      if (filters.startTime && activity.startTime < filters.startTime) {
        return false;
      }
      if (filters.endTime && activity.endTime > filters.endTime) {
        return false;
      }
      return true;
    });
  }

  async findByName(name: string) {
    return this.prisma.activity.findUnique({
      where: { name },
      include: { participants: true },
    });
  }

  async create(dto: CreateActivityDto) {
    const { participants, scheduleDays, ...rest } = dto;
    return this.prisma.activity.create({
      data: {
        ...rest,
        scheduleDays: JSON.stringify(scheduleDays),
        participants: participants
          ? { create: participants.map((email) => ({ email })) }
          : undefined,
      },
      include: { participants: true },
    });
  }

  async addParticipant(activityId: number, email: string) {
    return this.prisma.participant.create({
      data: { email, activityId },
    });
  }

  async removeParticipant(activityId: number, email: string) {
    return this.prisma.participant.deleteMany({
      where: { activityId, email },
    });
  }

  async findAllDays(): Promise<string[]> {
    const activities = await this.prisma.activity.findMany({
      select: { scheduleDays: true },
    });

    const daysSet = new Set<string>();
    for (const activity of activities) {
      const days: string[] = JSON.parse(activity.scheduleDays);
      days.forEach((day) => daysSet.add(day));
    }

    return Array.from(daysSet).sort();
  }
}
