import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { IndicadoresResponseDto } from './dto/indicadores.dto';

@Injectable()
export class IndicadoresService {
  private readonly logger = new Logger(IndicadoresService.name);
  private readonly url = 'https://mindicador.cl/api';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Obtiene los indicadores económicos actuales (UF, Dólar, IPC, etc.).
   */
  async getIndicadores(): Promise<IndicadoresResponseDto> {
    try {
      this.logger.log('Consultando indicadores económicos a mindicador.cl');
      const { data } = await firstValueFrom<{
        data: {
          version: string;
          autor: string;
          fecha: string;
          uf?: { valor: number };
          dolar?: { valor: number };
          ipc?: { valor: number };
        };
      }>(
        this.httpService.get(this.url).pipe(
          catchError((error: Error) => {
            this.logger.error('Error al consultar mindicador.cl', error);
            throw error;
          }),
        ),
      );

      return {
        version: data.version,
        autor: data.autor,
        fecha: data.fecha,
        uf: data.uf?.valor || 0,
        dolar: data.dolar?.valor || 0,
        ipc: data.ipc?.valor || 0,
      };
    } catch {
      this.logger.warn('Falló la API de indicadores, usando mock de respaldo.');
      // Retornar fallback para asegurar resiliencia en el dashboard
      return {
        version: 'mock',
        autor: 'fallback',
        fecha: new Date().toISOString(),
        uf: 37000,
        dolar: 850,
        ipc: 0.3,
      };
    }
  }
}
