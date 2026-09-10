import { Module } from '@nestjs/common';
import {
  VendaController,
  VendaParcelaController,
  VendaParcelaService,
  VendaService,
} from './vendas.resource';

@Module({
  controllers: [VendaController, VendaParcelaController],
  providers: [VendaService, VendaParcelaService],
})
export class VendasModule {}
