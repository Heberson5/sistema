import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PessoasModule } from './pessoas/pessoas.module';
import { ProdutosServicosModule } from './produtos-servicos/produtos-servicos.module';
import { CemiterioModule } from './cemiterio/cemiterio.module';
import { PlanosModule } from './planos/planos.module';
import { VendasModule } from './vendas/vendas.module';
import { LocacoesModule } from './locacoes/locacoes.module';
import { AtendimentoModule } from './atendimento/atendimento.module';
import { GuiasMedicasModule } from './guias-medicas/guias-medicas.module';
import { AtendimentoClinicoModule } from './atendimento-clinico/atendimento-clinico.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    AuthModule,
    UsuariosModule,
    PessoasModule,
    ProdutosServicosModule,
    CemiterioModule,
    PlanosModule,
    VendasModule,
    LocacoesModule,
    AtendimentoModule,
    GuiasMedicasModule,
    AtendimentoClinicoModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
