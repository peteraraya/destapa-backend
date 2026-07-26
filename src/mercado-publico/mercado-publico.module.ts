import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MercadoPublicoService } from './mercado-publico.service';
import { MercadoPublicoController } from './mercado-publico.controller';

@Module({
  imports: [HttpModule],
  controllers: [MercadoPublicoController],
  providers: [MercadoPublicoService],
  exports: [MercadoPublicoService],
})
export class MercadoPublicoModule {}
