import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import prisma from '@juliana-gaspar/database';
import type { LoginDTO, AuthResponse } from '@juliana-gaspar/contracts';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(dto: LoginDTO): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('E-mail ou senha inválidos');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('E-mail ou senha inválidos');

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: user.id, name: user.name, email: user.email, role: user.role as 'ADMIN' | 'OPERATOR' | 'VIEWER' },
    };
  }
}
