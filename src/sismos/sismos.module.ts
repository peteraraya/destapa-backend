import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SismosService } from './sismos.service';
import { SismosController } from './sismos.controller';

@Module({
  imports: [HttpModule],
  controllers: [SismosController],
  providers: [SismosService],
  exports: [SismosService],
})
export class SismosModule {}
