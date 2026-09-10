import { Module } from '@nestjs/common';
import { PlanoController, PlanoCoberturaController, PlanoCoberturaService, PlanoService } from './plano.resource';
import {
  BeneficiarioController,
  BeneficiarioService,
  ContratoPlanoController,
  ContratoPlanoService,
  ParcelaPlanoController,
  ParcelaPlanoService,
} from './contrato-plano.resource';

@Module({
  controllers: [
    PlanoController,
    PlanoCoberturaController,
    ContratoPlanoController,
    BeneficiarioController,
    ParcelaPlanoController,
  ],
  providers: [
    PlanoService,
    PlanoCoberturaService,
    ContratoPlanoService,
    BeneficiarioService,
    ParcelaPlanoService,
  ],
  exports: [ContratoPlanoService],
})
export class PlanosModule {}
