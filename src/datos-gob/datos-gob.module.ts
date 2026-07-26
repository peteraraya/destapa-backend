import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DatosGobService } from './datos-gob.service';
import { DatosGobController } from './datos-gob.controller';

@Module({
  imports: [HttpModule],
  controllers: [DatosGobController],
  providers: [DatosGobService],
  exports: [DatosGobService],
})
export class DatosGobModule {}
