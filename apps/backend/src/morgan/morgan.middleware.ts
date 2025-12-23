import { Injectable, NestMiddleware } from '@nestjs/common';
import morgan from 'morgan';

@Injectable()
export class MorganMiddleware implements NestMiddleware {
  use(req, res, next: () => void) {
    // 'dev' is a predefined Morgan format
    morgan('dev')(req, res, next);
  }
}
