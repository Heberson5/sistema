import { Module } from '@nestjs/common';
import { ObitoController, ObitoService } from './obito.resource';
import {
  AtendimentoController,
  AtendimentoItemController,
  AtendimentoItemService,
  AtendimentoService,
} from './atendimento.resource';

@Module({
  controllers: [ObitoController, AtendimentoController, AtendimentoItemController],
  providers: [ObitoService, AtendimentoService, AtendimentoItemService],
})
export class AtendimentoModule {}
