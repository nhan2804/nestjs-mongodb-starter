import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ULog } from 'src/helper/ulti';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    ULog(null, {}, ['LoggerMiddleware...']);
    next();
  }
}
