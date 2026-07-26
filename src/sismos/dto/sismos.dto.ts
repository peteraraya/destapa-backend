import { ApiProperty } from '@nestjs/swagger';

export class SismosResponseDto {
  @ApiProperty({ example: '5.2' })
  magnitude!: string;

  @ApiProperty({ example: '25 km al NO de Santiago' })
  location!: string;

  @ApiProperty({ example: '2023-10-15T14:30:00Z' })
  date!: string;
}
