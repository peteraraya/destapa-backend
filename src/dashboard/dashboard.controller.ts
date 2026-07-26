import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { GetDashboardDto, DashboardResponseDto } from './dto/dashboard.dto';

@ApiTags('Dashboard')
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtiene el dashboard unificado de una comuna',
    description:
      'Cruza datos de gasto público, indicadores económicos y seguridad.',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos del dashboard retornados exitosamente.',
    type: DashboardResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Faltan parámetros requeridos.' })
  async getDashboard(
    @Query() query: GetDashboardDto,
  ): Promise<DashboardResponseDto> {
    return this.dashboardService.getDashboard(query.comuna);
  }
}
