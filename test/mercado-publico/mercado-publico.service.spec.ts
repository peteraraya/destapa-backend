import { Test, TestingModule } from '@nestjs/testing';
import { MercadoPublicoService } from '../../src/mercado-publico/mercado-publico.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';

describe('MercadoPublicoService', () => {
  let service: MercadoPublicoService;
  let httpServiceMock: { get: jest.Mock };
  let configServiceMock: { get: jest.Mock };

  beforeEach(async () => {
    httpServiceMock = {
      get: jest.fn(),
    };
    configServiceMock = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MercadoPublicoService,
        { provide: HttpService, useValue: httpServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get<MercadoPublicoService>(MercadoPublicoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return mock data if no ticket is provided', async () => {
    configServiceMock.get.mockReturnValue(null);
    const result = await service.getLicitacionesPorComuna('13101');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].CodigoExterno).toBe('1234-56-LE23');
    expect(httpServiceMock.get).not.toHaveBeenCalled();
  });

  it('should call api if ticket is provided', async () => {
    configServiceMock.get.mockReturnValue('TEST_TICKET');
    const apiResponse = { data: { Listado: [{ CodigoExterno: 'REAL-LE23' }] } };
    httpServiceMock.get.mockReturnValue(of(apiResponse));

    const result = await service.getLicitacionesPorComuna('13101');
    expect(result).toHaveLength(1);
    expect(result[0].CodigoExterno).toBe('REAL-LE23');
    expect(httpServiceMock.get).toHaveBeenCalledWith(
      expect.stringContaining('ticket=TEST_TICKET&fecha='),
    );
  });

  it('should fallback to mock data if api fails', async () => {
    configServiceMock.get.mockReturnValue('TEST_TICKET');
    httpServiceMock.get.mockReturnValue(
      throwError(() => new Error('API Error')),
    );

    const result = await service.getLicitacionesPorComuna('13101');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].CodigoExterno).toBe('1234-56-LE23');
  });
});
