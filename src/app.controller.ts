import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Endpoint de prueba (Hello World)',
    description:
      'Retorna un mensaje simple para verificar que la API está funcionando.',
  })
  @ApiResponse({
    status: 200,
    description: 'Mensaje de saludo retornado exitosamente.',
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
