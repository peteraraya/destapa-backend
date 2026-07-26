import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { SismosResponseDto } from './dto/sismos.dto';

@Injectable()
export class SismosService {
  private readonly logger = new Logger(SismosService.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Obtiene los últimos sismos registrados (últimos 15) en Chile
   * a través de la API de Boostr.cl
   */
  async getUltimosSismos(): Promise<SismosResponseDto[]> {
    try {
      this.logger.log('Obteniendo últimos sismos de boostr.cl');
      const { data } = await firstValueFrom<{
        data: {
          data?:
            | Array<{
                magnitude?: string | number;
                Magnitud?: string | number;
                location?: string;
                RefGeografica?: string;
                date?: string;
                Fecha?: string;
                place?: string;
              }>
            | {
                magnitude?: string | number;
                Magnitud?: string | number;
                location?: string;
                RefGeografica?: string;
                date?: string;
                Fecha?: string;
                place?: string;
              };
        };
      }>(
        this.httpService.get('https://api.boostr.cl/earthquakes.json').pipe(
          catchError((error: Error) => {
            this.logger.error('Error al obtener sismos de Boostr', error);
            throw error;
          }),
        ),
      );

      // Boostr retorna los datos dentro del campo "data"
      let sismosData = data?.data;
      if (!sismosData) {
        sismosData = [];
      } else if (!Array.isArray(sismosData)) {
        sismosData = [sismosData];
      }

      return sismosData.map((s) => ({
        magnitude: String(s.magnitude || s.Magnitud),
        location: String(s.place || s.location || s.RefGeografica),
        date: String(s.date || s.Fecha),
      }));
    } catch {
      this.logger.error('No se pudo obtener la información de sismos');
      // Retornar array vacío para evitar romper el flujo principal
      return [];
    }
  }
}
