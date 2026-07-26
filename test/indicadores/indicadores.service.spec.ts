import { Test, TestingModule } from '@nestjs/testing';
import { IndicadoresService } from '../../src/indicadores/indicadores.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';

describe('IndicadoresService', () => {
  let service: IndicadoresService;
  let httpServiceMock: { get: jest.Mock };

  beforeEach(async () => {
    httpServiceMock = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IndicadoresService,
        { provide: HttpService, useValue: httpServiceMock },
      ],
    }).compile();

    service = module.get<IndicadoresService>(IndicadoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return mapped data on successful API call', async () => {
    const mockApiResponse = {
      data: {
        version: '1.7.0',
        autor: 'mindicador.cl',
        fecha: '2023-10-26T03:00:00.000Z',
        uf: { valor: 37500.5 },
        dolar: { valor: 890.3 },
        ipc: { valor: 0.4 },
      },
    };
    httpServiceMock.get.mockReturnValue(of(mockApiResponse));

    const result = await service.getIndicadores();
    expect(result.version).toBe('1.7.0');
    expect(result.uf).toBe(37500.5);
    expect(result.dolar).toBe(890.3);
    expect(httpServiceMock.get).toHaveBeenCalled();
  });

  it('should return fallback mock data on API failure', async () => {
    httpServiceMock.get.mockReturnValue(
      throwError(() => new Error('Network error')),
    );

    const result = await service.getIndicadores();
    expect(result.version).toBe('mock');
    expect(result.uf).toBe(37000);
    expect(result.dolar).toBe(850);
  });
});
