import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // Hash "morto" usado apenas para equalizar o tempo de resposta quando o
  // e-mail não existe, evitando que o tempo da requisição revele se a conta existe.
  private static readonly DUMMY_HASH =
    '$2b$12$GWsADalmFL52KYvogrF.U.Vwrz35Z2g2HiFJYoaXMWEM6y9fkgFHC';

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({ where: { email: dto.email } });

    const senhaValida = await bcrypt.compare(
      dto.senha,
      usuario?.senhaHash ?? AuthService.DUMMY_HASH,
    );

    if (!usuario || !usuario.ativo || !senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      papel: usuario.papel,
      nome: usuario.nome,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
      },
    };
  }

  async me(userId: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id: userId } });
    if (!usuario) throw new UnauthorizedException();
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel,
    };
  }
}
