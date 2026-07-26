import { Test, TestingModule } from '@nestjs/testing';
import { SismosService } from '../../src/sismos/sismos.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';

describe('SismosService', () => {
  let service: SismosService;
  let httpServiceMock: { get: jest.Mock };

  beforeEach(async () => {
    httpServiceMock = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SismosService,
        { provide: HttpService, useValue: httpServiceMock },
      ],
    }).compile();

    service = module.get<SismosService>(SismosService);
  });

  it('should return formatted data on successful API call', async () => {
    const mockApiResponse = {
      data: {
        data: [
          { Magnitud: 5.4, RefGeografica: 'Valparaíso', Fecha: '2023-10-26' },
        ],
      },
    };
    httpServiceMock.get.mockReturnValue(of(mockApiResponse));

    const result = await service.getUltimosSismos();
    expect(result).toHaveLength(1);
    expect(result[0].magnitude).toBe('5.4');
  });

  it('should return empty array on failure (boostr fallback)', async () => {
    httpServiceMock.get.mockReturnValue(
      throwError(() => new Error('Network error')),
    );

    const result = await service.getUltimosSismos();
    expect(result).toHaveLength(0);
  });
});
