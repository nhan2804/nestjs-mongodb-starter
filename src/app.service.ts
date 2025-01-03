import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}
  getVersion() {
    // throw new BadRequestException();
    return {
      forceRefresh: true,
      version: this.configService.get('APP_VERSION'),
      message: 'x',
    };
  }
}
