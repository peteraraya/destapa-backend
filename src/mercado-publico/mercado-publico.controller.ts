import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MercadoPublicoService } from './mercado-publico.service';
import { GetLicitacionesDto, LicitacionDto } from './dto/mercado-publico.dto';

@ApiTags('Mercado Público')
@Controller('api/mercado-publico')
export class MercadoPublicoController {
  constructor(private readonly mercadoPublicoService: MercadoPublicoService) {}

  @Get('licitaciones')
  @ApiOperation({
    summary: 'Obtiene las licitaciones por código de comuna',
    description:
      'Llama a la API de Mercado Público o usa datos mockeados si no hay token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Licitaciones retornadas exitosamente.',
    type: [LicitacionDto],
  })
  @ApiResponse({ status: 400, description: 'Falta el parámetro codigoComuna.' })
  async getLicitaciones(
    @Query() query: GetLicitacionesDto,
  ): Promise<LicitacionDto[]> {
    return this.mercadoPublicoService.getLicitacionesPorComuna(
      query.codigoComuna,
    );
  }
}
