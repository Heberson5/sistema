import { Module } from '@nestjs/common';
import { UsuariosController, UsuariosService } from './usuarios.resource';

@Module({
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
