import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IndicadoresService } from './indicadores.service';
import { IndicadoresController } from './indicadores.controller';

@Module({
  imports: [HttpModule],
  controllers: [IndicadoresController],
  providers: [IndicadoresService],
  exports: [IndicadoresService],
})
export class IndicadoresModule {}
