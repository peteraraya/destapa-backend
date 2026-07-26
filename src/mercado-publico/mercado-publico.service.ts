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
      // El endpoint exacto de comunas depende de la documentación privada, pero asumiendo una búsqueda de hoy:
      // Se utiliza fecha de hoy para no traer histórico masivo y se busca por organismo asociado a la comuna,
      // o bien si la API permite buscar por codigoComuna directamente, como indicaba el requerimiento:
      const url = `${this.baseUrl}/licitaciones.json?ticket=${ticket}&CodigoComuna=${codigoComuna}`;

      const { data } = await firstValueFrom<{
        data: {
          Listado?: LicitacionDto[];
        };
      }>(
        this.httpService.get(url).pipe(
          catchError((error: Error) => {
            this.logger.error('Error al consultar Mercado Público', error);
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
