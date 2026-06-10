import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const requestId = uuidv4();
    const start = Date.now();

    res.setHeader('X-Request-Id', requestId);

    this.logger.log(
      `[HTTP REQ] [${requestId}] ${method} ${originalUrl} [${ip}]`,
    );

    res.on('finish', () => {
      const ms = Date.now() - start;
      const { statusCode } = res;
      this.logger.log(
        `[HTTP RES] [${requestId}] ${method} ${originalUrl} ${statusCode} ${ms}ms`,
      );
    });

    next();
  }
}
