import { Module } from '@nestjs/common';
import {
  AtendimentoClinicoController,
  AtendimentoClinicoService,
} from './atendimento-clinico.resource';

@Module({
  controllers: [AtendimentoClinicoController],
  providers: [AtendimentoClinicoService],
})
export class AtendimentoClinicoModule {}
