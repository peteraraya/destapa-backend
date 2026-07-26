import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SismosService } from './sismos.service';
import { SismosResponseDto } from './dto/sismos.dto';

@ApiTags('Sismos')
@Controller('api/sismos')
export class SismosController {
  constructor(private readonly sismosService: SismosService) {}

  @Get('ultimos')
  @ApiOperation({
    summary: 'Obtiene los últimos sismos',
    description:
      'Llama a la API externa para obtener el listado de los últimos sismos registrados en Chile.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de últimos sismos retornada exitosamente.',
    type: [SismosResponseDto],
  })
  async getUltimosSismos(): Promise<SismosResponseDto[]> {
    return this.sismosService.getUltimosSismos();
  }
}
