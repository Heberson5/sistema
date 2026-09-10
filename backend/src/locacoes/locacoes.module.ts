import { Module } from '@nestjs/common';
import {
  EquipamentoOrtopedicoController,
  EquipamentoOrtopedicoService,
  SalaComercialController,
  SalaComercialService,
} from './recursos-locaveis.resource';
import {
  LocacaoController,
  LocacaoParcelaController,
  LocacaoParcelaService,
  LocacaoService,
} from './locacao.resource';

@Module({
  controllers: [
    SalaComercialController,
    EquipamentoOrtopedicoController,
    LocacaoController,
    LocacaoParcelaController,
  ],
  providers: [SalaComercialService, EquipamentoOrtopedicoService, LocacaoService, LocacaoParcelaService],
})
export class LocacoesModule {}
