import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DatosGobService } from './datos-gob.service';
import {
  GetCodigoComunaDto,
  CodigoComunaResponseDto,
} from './dto/datos-gob.dto';

@ApiTags('Datos Gob')
@Controller('api/datos-gob')
export class DatosGobController {
  constructor(private readonly datosGobService: DatosGobService) {}

  @Get('codigo-comuna')
  @ApiOperation({
    summary: 'Obtiene el código de una comuna',
    description:
      'Busca el código de una comuna (ej. 13110) basado en su nombre usando datos locales estáticos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Código de comuna retornado exitosamente.',
    type: CodigoComunaResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Falta el parámetro comuna.' })
  @ApiResponse({ status: 404, description: 'Comuna no encontrada.' })
  async getCodigoComuna(
    @Query() query: GetCodigoComunaDto,
  ): Promise<CodigoComunaResponseDto> {
    const codigo = await this.datosGobService.getCodigoComuna(query.comuna);
    if (!codigo) {
      throw new NotFoundException(`Comuna '${query.comuna}' no encontrada`);
    }
    return { comuna: query.comuna, codigo };
  }

  @Get('datasets')
  @ApiOperation({
    summary: 'Obtiene datasets de división territorial',
    description:
      'Busca los datasets disponibles en datos.gob.cl sobre división territorial.',
  })
  @ApiResponse({
    status: 200,
    description: 'Datasets retornados exitosamente.',
  })
  async getDatasets() {
    return this.datosGobService.getDatasetsDivisionTerritorial();
  }
}
