import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { LicitacionDto } from './dto/mercado-publico.dto';

@Injectable()
export class MercadoPublicoService {
  private readonly logger = new Logger(MercadoPublicoService.name);
  private readonly baseUrl =
    'https://api.mercadopublico.cl/servicios/v1/publico';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Obtiene las licitaciones para una comuna específica.
   * Utiliza el ticket configurado en las variables de entorno.
   * @param codigoComuna Código DPA de la comuna
   */
  async getLicitacionesPorComuna(
    codigoComuna: string,
  ): Promise<LicitacionDto[]> {
    const ticket = this.configService.get<string>('MERCADO_PUBLICO_TICKET');

    if (!ticket) {
      this.logger.warn(
        'No se encontró MERCADO_PUBLICO_TICKET. Usando datos simulados para demostración.',
      );
      return this.getMockData(codigoComuna);
    }

    try {
      this.logger.log(
        `Consultando Mercado Público para comuna código: ${codigoComuna}`,
      );
      // Para la API de Mercado Público, "CodigoComuna" no es un parámetro válido.
      // Usaremos la búsqueda por "fecha" del día actual (ddmmyyyy) para obtener licitaciones recientes
      // a modo de demostración.
      const hoy = new Date();
      const d = String(hoy.getDate()).padStart(2, '0');
      const m = String(hoy.getMonth() + 1).padStart(2, '0');
      const y = hoy.getFullYear();
      const fechaHoy = `${d}${m}${y}`;

      const url = `${this.baseUrl}/licitaciones.json?ticket=${ticket}&fecha=${fechaHoy}`;

      const { data } = await firstValueFrom<{
        data: {
          Listado?: LicitacionDto[];
        };
      }>(
        this.httpService.get(url).pipe(
          catchError((error: Error) => {
            this.logger.error(
              'Error al consultar Mercado Público',
              error.message || String(error),
            );
            throw error;
          }),
        ),
      );

      return data?.Listado || [];
    } catch {
      this.logger.error(
        'Falló la API de Mercado Público, retornando datos simulados por resiliencia.',
      );
      return this.getMockData(codigoComuna);
    }
  }

  /**
   * Genera datos simulados útiles para el portfolio / frontend
   * si la API no está disponible o no hay ticket.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getMockData(codigoComuna: string): LicitacionDto[] {
    return [
      {
        CodigoExterno: '1234-56-LE23',
        Nombre: 'Construcción Plaza Central',
        CodigoEstado: 5,
        Estado: 'Adjudicada',
        MontoEstimado: 150000000, // En pesos
        Adjudicacion: {
          Proveedor: {
            Nombre: 'Constructora XYZ',
            Rut: '76.123.456-7',
          },
        },
      },
      {
        CodigoExterno: '1234-57-LE23',
        Nombre: 'Insumos Médicos Consultorio',
        CodigoEstado: 5,
        Estado: 'Adjudicada',
        MontoEstimado: 75000000,
        Adjudicacion: {
          Proveedor: {
            Nombre: 'Servicios ABC',
            Rut: '77.987.654-3',
          },
        },
      },
      {
        CodigoExterno: '1234-58-LE23',
        Nombre: 'Mantenimiento Luminarias',
        CodigoEstado: 5,
        Estado: 'Adjudicada',
        MontoEstimado: 35000000,
        Adjudicacion: {
          Proveedor: {
            Nombre: 'Constructora XYZ',
            Rut: '76.123.456-7',
          },
        },
      },
    ];
  }
}
