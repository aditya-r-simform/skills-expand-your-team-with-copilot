import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { LoginDto } from './dto/login.dto';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async login(dto: LoginDto) {
    const teacher = await this.authRepository.findByUsername(dto.username);

    if (!teacher) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const isPasswordValid = await argon2.verify(teacher.password, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    return {
      username: teacher.username,
      displayName: teacher.displayName,
      role: teacher.role,
    };
  }

  async checkSession(username: string) {
    const teacher = await this.authRepository.findByUsername(username);

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return {
      username: teacher.username,
      displayName: teacher.displayName,
      role: teacher.role,
    };
  }
}
