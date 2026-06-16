import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AuthService } from './auth.service';
import { loginSchema, type LoginDTO } from '@juliana-gaspar/contracts';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body(new ZodValidationPipe(loginSchema)) dto: LoginDTO) {
    return this.authService.login(dto);
  }
}
