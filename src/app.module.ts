import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DashboardModule } from './dashboard/dashboard.module';
import { MercadoPublicoModule } from './mercado-publico/mercado-publico.module';
import { IndicadoresModule } from './indicadores/indicadores.module';
import { SismosModule } from './sismos/sismos.module';
import { DatosGobModule } from './datos-gob/datos-gob.module';

@Module({
  imports: [
    // Configuración global de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Configuración de caché en memoria (TTL de 5 minutos por defecto)
    CacheModule.register({
      isGlobal: true,
      ttl: 5 * 60 * 1000, // 5 minutos en milisegundos
    }),
    DashboardModule,
    MercadoPublicoModule,
    IndicadoresModule,
    SismosModule,
    DatosGobModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
