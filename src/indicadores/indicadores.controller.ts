import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IndicadoresService } from './indicadores.service';
import { IndicadoresResponseDto } from './dto/indicadores.dto';

@ApiTags('Indicadores Económicos')
@Controller('api/indicadores')
export class IndicadoresController {
  constructor(private readonly indicadoresService: IndicadoresService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtiene los indicadores económicos actuales',
    description:
      'Llama a mindicador.cl para obtener el valor de la UF, Dólar, Euro, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Indicadores retornados exitosamente.',
    type: IndicadoresResponseDto,
  })
  async getIndicadores(): Promise<IndicadoresResponseDto> {
    return this.indicadoresService.getIndicadores();
  }
}
