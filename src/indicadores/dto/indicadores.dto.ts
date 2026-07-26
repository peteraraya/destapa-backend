import { ApiProperty } from '@nestjs/swagger';

export class IndicadoresResponseDto {
  @ApiProperty({ example: '1.0' })
  version!: string;

  @ApiProperty({ example: 'Indicadores económicos' })
  autor!: string;

  @ApiProperty({ example: '2023-10-25T14:30:00.000Z' })
  fecha!: string;

  @ApiProperty({ example: 37000 })
  uf!: number;

  @ApiProperty({ example: 850 })
  dolar!: number;

  @ApiProperty({ example: 0.3 })
  ipc!: number;
}
