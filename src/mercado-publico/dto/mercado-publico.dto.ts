import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetLicitacionesDto {
  @ApiProperty({
    description: 'Código de la comuna (ej. 13110 para La Florida)',
    example: '13110',
  })
  @IsString()
  @IsNotEmpty({ message: 'El parámetro codigoComuna es requerido' })
  codigoComuna!: string;
}

class ProveedorAdjudicacionDto {
  @ApiProperty({ example: 'Constructora XYZ' })
  Nombre!: string;

  @ApiProperty({ example: '76.123.456-7' })
  Rut!: string;
}

class AdjudicacionDto {
  @ApiProperty({ type: () => ProveedorAdjudicacionDto })
  Proveedor!: ProveedorAdjudicacionDto;
}

export class LicitacionDto {
  @ApiProperty({ example: '1234-56-LE23' })
  CodigoExterno!: string;

  @ApiProperty({ example: 'Construcción Plaza Central' })
  Nombre!: string;

  @ApiProperty({ example: 5 })
  CodigoEstado!: number;

  @ApiProperty({ example: 'Adjudicada' })
  Estado!: string;

  @ApiProperty({ example: 150000000 })
  MontoEstimado!: number;

  @ApiProperty({ type: () => AdjudicacionDto, required: false })
  Adjudicacion?: AdjudicacionDto;
}
