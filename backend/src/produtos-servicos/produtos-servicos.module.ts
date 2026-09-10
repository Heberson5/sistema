import { Module } from '@nestjs/common';
import {
  ProdutosController,
  ProdutosService,
  ServicosController,
  ServicosService,
} from './produtos-servicos.resource';

@Module({
  controllers: [ProdutosController, ServicosController],
  providers: [ProdutosService, ServicosService],
  exports: [ProdutosService, ServicosService],
})
export class ProdutosServicosModule {}
