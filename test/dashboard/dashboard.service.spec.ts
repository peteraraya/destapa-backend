import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from '../../src/dashboard/dashboard.service';
import { IndicadoresService } from '../../src/indicadores/indicadores.service';
import { SismosService } from '../../src/sismos/sismos.service';
import { MercadoPublicoService } from '../../src/mercado-publico/mercado-publico.service';
import { DatosGobService } from '../../src/datos-gob/datos-gob.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';

describe('DashboardService', () => {
  let service: DashboardService;
  let cacheManagerMock: { get: jest.Mock; set: jest.Mock };
  let datosGobServiceMock: { getCodigoComuna: jest.Mock };
  let indicadoresServiceMock: { getIndicadores: jest.Mock };
  let sismosServiceMock: { getUltimosSismos: jest.Mock };
  let mercadoPublicoServiceMock: { getLicitacionesPorComuna: jest.Mock };

  beforeEach(async () => {
    cacheManagerMock = {
      get: jest.fn(),
      set: jest.fn(),
    };
    datosGobServiceMock = {
      getCodigoComuna: jest.fn(),
    };
    indicadoresServiceMock = {
      getIndicadores: jest.fn(),
    };
    sismosServiceMock = {
      getUltimosSismos: jest.fn(),
    };
    mercadoPublicoServiceMock = {
      getLicitacionesPorComuna: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
        { provide: DatosGobService, useValue: datosGobServiceMock },
        { provide: IndicadoresService, useValue: indicadoresServiceMock },
        { provide: SismosService, useValue: sismosServiceMock },
        { provide: MercadoPublicoService, useValue: mercadoPublicoServiceMock },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return cached data if available', async () => {
    const cachedData = { comuna: 'TestComuna' };
    cacheManagerMock.get.mockResolvedValue(cachedData);

    const result = await service.getDashboard('TestComuna');

    expect(cacheManagerMock.get).toHaveBeenCalledWith('dashboard_testcomuna');
    expect(result).toEqual(cachedData);
    expect(datosGobServiceMock.getCodigoComuna).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if comuna code is not found', async () => {
    cacheManagerMock.get.mockResolvedValue(null);
    datosGobServiceMock.getCodigoComuna.mockResolvedValue(null);

    await expect(service.getDashboard('InvalidComuna')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should aggregate data successfully when all services resolve', async () => {
    cacheManagerMock.get.mockResolvedValue(null);
    datosGobServiceMock.getCodigoComuna.mockResolvedValue('13101');

    indicadoresServiceMock.getIndicadores.mockResolvedValue({ uf: 35000 });
    sismosServiceMock.getUltimosSismos.mockResolvedValue([
      { magnitude: '5.0', location: 'Centro', date: '2023' },
    ]);
    mercadoPublicoServiceMock.getLicitacionesPorComuna.mockResolvedValue([
      {
        MontoEstimado: 35000000,
        Adjudicacion: { Proveedor: { Nombre: 'Prov1' } },
      },
    ]);

    const result = await service.getDashboard('santiago');

    expect(result.codigo_comuna).toBe('13101');
    expect(result.comuna).toBe('Santiago');
    expect(result.resumen_gasto.total_licitaciones).toBe(1);
    expect(result.resumen_gasto.monto_total_pesos).toBe(35000000);
    expect(result.resumen_gasto.monto_total_uf).toBe(1000); // 35000000 / 35000
    expect(result.seguridad.ultimo_sismo?.magnitud).toBe('5.0');
    expect(cacheManagerMock.set).toHaveBeenCalled();
  });
});
