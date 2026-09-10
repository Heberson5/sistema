import { Module } from '@nestjs/common';
import {
  AlaController,
  AlaService,
  AlamedaController,
  AlamedaService,
  BlocoController,
  BlocoService,
  CemiterioController,
  CemiterioService,
  QuadraController,
  QuadraService,
} from './cemiterio-estrutura.resource';
import {
  ColumbarioController,
  ColumbarioService,
  JazigoController,
  JazigoService,
  OssuarioController,
  OssuarioService,
  TipoColumbarioController,
  TipoColumbarioService,
  TipoJazigoController,
  TipoJazigoService,
} from './unidades.resource';

@Module({
  controllers: [
    CemiterioController,
    QuadraController,
    AlamedaController,
    AlaController,
    BlocoController,
    TipoJazigoController,
    TipoColumbarioController,
    JazigoController,
    ColumbarioController,
    OssuarioController,
  ],
  providers: [
    CemiterioService,
    QuadraService,
    AlamedaService,
    AlaService,
    BlocoService,
    TipoJazigoService,
    TipoColumbarioService,
    JazigoService,
    ColumbarioService,
    OssuarioService,
  ],
  exports: [JazigoService, ColumbarioService, OssuarioService],
})
export class CemiterioModule {}
