import { Module } from '@nestjs/common';
import { PessoasController, PessoasService } from './pessoas.resource';

@Module({
  controllers: [PessoasController],
  providers: [PessoasService],
  exports: [PessoasService],
})
export class PessoasModule {}
