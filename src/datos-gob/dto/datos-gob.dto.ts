import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetCodigoComunaDto {
  @ApiProperty({
    description: 'Nombre de la comuna (ej. La Florida, Santiago)',
    example: 'La Florida',
  })
  @IsString()
  @IsNotEmpty({ message: 'El parámetro comuna es requerido' })
  comuna!: string;
}

export class CodigoComunaResponseDto {
  @ApiProperty({ example: 'La Florida' })
  comuna!: string;

  @ApiProperty({ example: '13110' })
  codigo!: string;
}
