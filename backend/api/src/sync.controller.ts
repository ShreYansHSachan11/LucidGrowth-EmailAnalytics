import { Body, Controller, Get, Post } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('start')
  start(@Body() body: any) {
    return this.syncService.startSync(body);
  }

  @Post('pause')
  pause() {
    return this.syncService.pause();
  }

  @Post('resume')
  resume() {
    return this.syncService.resume();
  }

  @Get('status')
  status() {
    return this.syncService.getStatus();
  }
}
