import { Module } from '@nestjs/common';
import {
  PrestadorController,
  PrestadorService,
  ProcedimentoMedicoController,
  ProcedimentoMedicoService,
} from './prestador-procedimento.resource';
import {
  GuiaMedicaController,
  GuiaMedicaItemController,
  GuiaMedicaItemService,
  GuiaMedicaService,
} from './guia-medica.resource';

@Module({
  controllers: [
    PrestadorController,
    ProcedimentoMedicoController,
    GuiaMedicaController,
    GuiaMedicaItemController,
  ],
  providers: [PrestadorService, ProcedimentoMedicoService, GuiaMedicaService, GuiaMedicaItemService],
})
export class GuiasMedicasModule {}
