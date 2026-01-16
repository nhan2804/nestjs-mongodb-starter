import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/guards/public';
//s
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Public()
  @Get('version')
  getVersion() {
    return this.appService.getVersion();
  }
}
