import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { IndicadoresService } from '../indicadores/indicadores.service';
import { SismosService } from '../sismos/sismos.service';
import { MercadoPublicoService } from '../mercado-publico/mercado-publico.service';
import { DatosGobService } from '../datos-gob/datos-gob.service';
import { DashboardResponseDto } from './dto/dashboard.dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly indicadoresService: IndicadoresService,
    private readonly sismosService: SismosService,
    private readonly mercadoPublicoService: MercadoPublicoService,
    private readonly datosGobService: DatosGobService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Orquesta la información obteniendo datos de múltiples APIs
   * y consolidando un resumen para la vista del ciudadano/PYME.
   * Aplica principios de Clean Code separando las responsabilidades de obtención y transformación.
   *
   * @param comuna Nombre de la comuna a consultar
   * @returns DTO estructurado con el dashboard de la comuna
   * @throws NotFoundException si la comuna no existe en los registros
   */
  async getDashboard(comuna: string): Promise<DashboardResponseDto> {
    this.logger.log(`Generando dashboard para la comuna: ${comuna}`);

    const cacheKey = this.generateCacheKey(comuna);
    const cachedData = await this.getCachedDashboard(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const codigoComuna = await this.resolveCodigoComuna(comuna);
    const { indicadores, sismos, licitaciones } =
      await this.fetchDashboardData(codigoComuna);

    const response = this.buildDashboardResponse(
      comuna,
      codigoComuna,
      licitaciones,
      indicadores,
      sismos,
    );

    await this.cacheManager.set(cacheKey, response);
    return response;
  }

  private generateCacheKey(comuna: string): string {
    return `dashboard_${comuna.trim().toLowerCase()}`;
  }

  private async getCachedDashboard(
    cacheKey: string,
  ): Promise<DashboardResponseDto | null> {
    const cachedData =
      await this.cacheManager.get<DashboardResponseDto>(cacheKey);
    if (cachedData) {
      this.logger.log(
        `Retornando dashboard desde caché para la key: ${cacheKey}`,
      );
      return cachedData;
    }
    return null;
  }

  private async resolveCodigoComuna(comuna: string): Promise<string> {
    const codigoComuna = await this.datosGobService.getCodigoComuna(comuna);
    if (!codigoComuna) {
      throw new NotFoundException(
        `La comuna '${comuna}' no fue encontrada o no es válida.`,
      );
    }
    return codigoComuna;
  }

  private async fetchDashboardData(codigoComuna: string) {
    const [indicadoresResult, sismosResult, licitacionesResult] =
      await Promise.allSettled([
        this.indicadoresService.getIndicadores(),
        this.sismosService.getUltimosSismos(),
        this.mercadoPublicoService.getLicitacionesPorComuna(codigoComuna),
      ]);

    return {
      indicadores:
        indicadoresResult.status === 'fulfilled'
          ? indicadoresResult.value
          : null,
      sismos: sismosResult.status === 'fulfilled' ? sismosResult.value : [],
      licitaciones:
        licitacionesResult.status === 'fulfilled'
          ? licitacionesResult.value
          : [],
    };
  }

  private buildDashboardResponse(
    comuna: string,
    codigoComuna: string,
    licitaciones: import('../mercado-publico/dto/mercado-publico.dto').LicitacionDto[],
    indicadores:
      | import('../indicadores/dto/indicadores.dto').IndicadoresResponseDto
      | null,
    sismos: import('../sismos/dto/sismos.dto').SismosResponseDto[],
  ): DashboardResponseDto {
    const { totalMontoPesos, topProveedores } =
      this.procesarLicitaciones(licitaciones);

    let totalMontoUF: number | null = null;
    if (indicadores?.uf && totalMontoPesos > 0) {
      totalMontoUF = parseFloat((totalMontoPesos / indicadores.uf).toFixed(2));
    }

    return {
      comuna: this.capitalize(comuna),
      codigo_comuna: codigoComuna,
      resumen_gasto: {
        total_licitaciones: licitaciones.length,
        monto_total_uf: totalMontoUF,
        monto_total_pesos: totalMontoPesos,
      },
      top_proveedores: topProveedores,
      contexto_economico: {
        uf_valor: indicadores?.uf || null,
        dolar_valor: indicadores?.dolar || null,
        ipc_mensual: indicadores?.ipc || null,
      },
      seguridad: {
        ultimo_sismo:
          sismos.length > 0
            ? {
                magnitud: sismos[0].magnitude,
                lugar: sismos[0].location,
                fecha: sismos[0].date,
              }
            : null,
      },
    };
  }

  /**
   * Calcula el gasto total y extrae los principales proveedores.
   */
  private procesarLicitaciones(
    licitaciones: import('../mercado-publico/dto/mercado-publico.dto').LicitacionDto[],
  ) {
    let totalMontoPesos = 0;
    const proveedoresMap = new Map<string, number>();

    for (const lic of licitaciones) {
      // Asumimos que MontoEstimado viene en la respuesta o extraemos el valor según la API real
      const monto = Number(lic.MontoEstimado) || 0;
      totalMontoPesos += monto;

      // Obtener el proveedor si existe (asumiendo estructura de ejemplo o adjudicada)
      const proveedorNombre = lic.Adjudicacion?.Proveedor?.Nombre;
      if (proveedorNombre) {
        const montoAcumulado = proveedoresMap.get(proveedorNombre) || 0;
        proveedoresMap.set(proveedorNombre, montoAcumulado + monto);
      }
    }

    // Convertir el mapa en un array y ordenar por monto descendente
    const topProveedores = Array.from(proveedoresMap.entries())
      .map(([nombre, monto]) => ({ nombre, monto }))
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 5); // Tomamos el top 5

    return { totalMontoPesos, topProveedores };
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}
