import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { IndicadoresModule } from '../indicadores/indicadores.module';
import { SismosModule } from '../sismos/sismos.module';
import { DatosGobModule } from '../datos-gob/datos-gob.module';
import { MercadoPublicoModule } from '../mercado-publico/mercado-publico.module';

@Module({
  imports: [
    IndicadoresModule,
    SismosModule,
    DatosGobModule,
    MercadoPublicoModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
