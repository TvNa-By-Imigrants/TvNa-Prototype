import { Module } from '@nestjs/common';
import { PingController } from './ping.controller.ts';

@Module({ controllers: [PingController] })
export class PingModule {}
