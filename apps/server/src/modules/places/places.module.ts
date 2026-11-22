import { Module } from '@nestjs/common';
import { PlacesController } from './places.controller.ts';
import { PlacesService } from './places.service.ts';

@Module({
  controllers: [PlacesController],
  providers: [PlacesService],
  exports: [PlacesService],
})
export class PlacesModule {}
