import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetDashboardDto {
  @ApiProperty({
    description: 'Nombre de la comuna a consultar',
    example: 'Puente Alto',
  })
  @IsString()
  @IsNotEmpty({ message: 'El parámetro comuna es requerido' })
  comuna!: string;
}

class ResumenGastoDto {
  @ApiProperty({ example: 15 })
  total_licitaciones!: number;

  @ApiProperty({ example: 500.5, nullable: true })
  monto_total_uf!: number | null;

  @ApiProperty({ example: 15000000 })
  monto_total_pesos!: number;
}

class ProveedorDto {
  @ApiProperty({ example: 'Constructora XYZ' })
  nombre!: string;

  @ApiProperty({ example: 5000000 })
  monto!: number;
}

class ContextoEconomicoDto {
  @ApiProperty({ example: 37000, nullable: true })
  uf_valor!: number | null;

  @ApiProperty({ example: 850, nullable: true })
  dolar_valor!: number | null;

  @ApiProperty({ example: 0.3, nullable: true })
  ipc_mensual!: number | null;
}

class SismoDto {
  @ApiProperty({ example: '5.2' })
  magnitud!: string;

  @ApiProperty({ example: '25 km al NO de Santiago' })
  lugar!: string;

  @ApiProperty({ example: '2023-10-15T14:30:00Z' })
  fecha!: string;
}

class SeguridadDto {
  @ApiProperty({ type: () => SismoDto, nullable: true })
  ultimo_sismo!: SismoDto | null;
}

export class DashboardResponseDto {
  @ApiProperty({ example: 'Puente alto' })
  comuna!: string;

  @ApiProperty({ example: '13201' })
  codigo_comuna!: string;

  @ApiProperty({ type: () => ResumenGastoDto })
  resumen_gasto!: ResumenGastoDto;

  @ApiProperty({ type: () => [ProveedorDto] })
  top_proveedores!: ProveedorDto[];

  @ApiProperty({ type: () => ContextoEconomicoDto })
  contexto_economico!: ContextoEconomicoDto;

  @ApiProperty({ type: () => SeguridadDto })
  seguridad!: SeguridadDto;
}
