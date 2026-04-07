import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const initialActivities = [
  {
    name: 'Chess Club',
    description: 'Learn strategies and compete in chess tournaments',
    schedule: 'Mondays and Fridays, 3:15 PM - 4:45 PM',
    scheduleDays: JSON.stringify(['Monday', 'Friday']),
    startTime: '15:15',
    endTime: '16:45',
    maxParticipants: 12,
    participants: ['michael@mergington.edu', 'daniel@mergington.edu'],
  },
  {
    name: 'Programming Class',
    description: 'Learn programming fundamentals and build software projects',
    schedule: 'Tuesdays and Thursdays, 7:00 AM - 8:00 AM',
    scheduleDays: JSON.stringify(['Tuesday', 'Thursday']),
    startTime: '07:00',
    endTime: '08:00',
    maxParticipants: 20,
    participants: ['emma@mergington.edu', 'sophia@mergington.edu'],
  },
  {
    name: 'Morning Fitness',
    description: 'Early morning physical training and exercises',
    schedule: 'Mondays, Wednesdays, Fridays, 6:30 AM - 7:45 AM',
    scheduleDays: JSON.stringify(['Monday', 'Wednesday', 'Friday']),
    startTime: '06:30',
    endTime: '07:45',
    maxParticipants: 30,
    participants: ['john@mergington.edu', 'olivia@mergington.edu'],
  },
  {
    name: 'Soccer Team',
    description: 'Join the school soccer team and compete in matches',
    schedule: 'Tuesdays and Thursdays, 3:30 PM - 5:30 PM',
    scheduleDays: JSON.stringify(['Tuesday', 'Thursday']),
    startTime: '15:30',
    endTime: '17:30',
    maxParticipants: 22,
    participants: ['liam@mergington.edu', 'noah@mergington.edu'],
  },
  {
    name: 'Basketball Team',
    description: 'Practice and compete in basketball tournaments',
    schedule: 'Wednesdays and Fridays, 3:15 PM - 5:00 PM',
    scheduleDays: JSON.stringify(['Wednesday', 'Friday']),
    startTime: '15:15',
    endTime: '17:00',
    maxParticipants: 15,
    participants: ['ava@mergington.edu', 'mia@mergington.edu'],
  },
  {
    name: 'Art Club',
    description: 'Explore various art techniques and create masterpieces',
    schedule: 'Thursdays, 3:15 PM - 5:00 PM',
    scheduleDays: JSON.stringify(['Thursday']),
    startTime: '15:15',
    endTime: '17:00',
    maxParticipants: 15,
    participants: ['amelia@mergington.edu', 'harper@mergington.edu'],
  },
  {
    name: 'Drama Club',
    description: 'Act, direct, and produce plays and performances',
    schedule: 'Mondays and Wednesdays, 3:30 PM - 5:30 PM',
    scheduleDays: JSON.stringify(['Monday', 'Wednesday']),
    startTime: '15:30',
    endTime: '17:30',
    maxParticipants: 20,
    participants: ['ella@mergington.edu', 'scarlett@mergington.edu'],
  },
  {
    name: 'Math Club',
    description: 'Solve challenging problems and prepare for math competitions',
    schedule: 'Tuesdays, 7:15 AM - 8:00 AM',
    scheduleDays: JSON.stringify(['Tuesday']),
    startTime: '07:15',
    endTime: '08:00',
    maxParticipants: 10,
    participants: ['james@mergington.edu', 'benjamin@mergington.edu'],
  },
  {
    name: 'Debate Team',
    description: 'Develop public speaking and argumentation skills',
    schedule: 'Fridays, 3:30 PM - 5:30 PM',
    scheduleDays: JSON.stringify(['Friday']),
    startTime: '15:30',
    endTime: '17:30',
    maxParticipants: 12,
    participants: ['charlotte@mergington.edu', 'amelia@mergington.edu'],
  },
  {
    name: 'Weekend Robotics Workshop',
    description: 'Build and program robots in our state-of-the-art workshop',
    schedule: 'Saturdays, 10:00 AM - 2:00 PM',
    scheduleDays: JSON.stringify(['Saturday']),
    startTime: '10:00',
    endTime: '14:00',
    maxParticipants: 15,
    participants: ['ethan@mergington.edu', 'oliver@mergington.edu'],
  },
  {
    name: 'Science Olympiad',
    description:
      'Weekend science competition preparation for regional and state events',
    schedule: 'Saturdays, 1:00 PM - 4:00 PM',
    scheduleDays: JSON.stringify(['Saturday']),
    startTime: '13:00',
    endTime: '16:00',
    maxParticipants: 18,
    participants: ['isabella@mergington.edu', 'lucas@mergington.edu'],
  },
  {
    name: 'Sunday Chess Tournament',
    description: 'Weekly tournament for serious chess players with rankings',
    schedule: 'Sundays, 2:00 PM - 5:00 PM',
    scheduleDays: JSON.stringify(['Sunday']),
    startTime: '14:00',
    endTime: '17:00',
    maxParticipants: 16,
    participants: ['william@mergington.edu', 'jacob@mergington.edu'],
  },
];

const initialTeachers = [
  {
    username: 'mrodriguez',
    displayName: 'Ms. Rodriguez',
    password: 'art123',
    role: 'teacher',
  },
  {
    username: 'mchen',
    displayName: 'Mr. Chen',
    password: 'chess456',
    role: 'teacher',
  },
  {
    username: 'principal',
    displayName: 'Principal Martinez',
    password: 'admin789',
    role: 'admin',
  },
];

async function main() {
  console.log('Seeding database...');

  // Seed activities
  for (const activity of initialActivities) {
    const { participants, ...activityData } = activity;

    const created = await prisma.activity.upsert({
      where: { name: activityData.name },
      update: {},
      create: {
        ...activityData,
        participants: {
          create: participants.map((email) => ({ email })),
        },
      },
    });

    console.log(`Upserted activity: ${created.name}`);
  }

  // Seed teachers
  for (const teacher of initialTeachers) {
    const hashedPassword = await argon2.hash(teacher.password);

    const created = await prisma.teacher.upsert({
      where: { username: teacher.username },
      update: {},
      create: {
        username: teacher.username,
        displayName: teacher.displayName,
        password: hashedPassword,
        role: teacher.role,
      },
    });

    console.log(`Upserted teacher: ${created.username}`);
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
