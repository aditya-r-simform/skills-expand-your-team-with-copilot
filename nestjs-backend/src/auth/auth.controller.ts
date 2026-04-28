import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

/**
 * AuthController — handles authentication routes.
 *
 * Applied per nestjs.instructions.md:
 * - Controllers are kept thin; all business logic delegated to AuthService
 * - @UsePipes(ValidationPipe) enforces DTO validation on all routes
 *
 * Security findings (security-review skill):
 * - checkSession: username query param validated to prevent empty-string lookups
 * - login: ValidationPipe ensures no malformed LoginDto reaches the service
 */
@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('check-session')
  checkSession(@Query('username') username: string) {
    // Security: reject empty/missing username to prevent unintended DB lookups
    if (!username || username.trim() === '') {
      throw new BadRequestException('username query parameter is required');
    }
    return this.authService.checkSession(username.trim());
  }
}
