import { Catch, RpcExceptionFilter, ArgumentsHost, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class GlobalRpcExceptionsFilter implements RpcExceptionFilter {
  private readonly logger = new Logger(GlobalRpcExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost): Observable<any> {
    this.logger.error(`RPC Error: ${exception.message}`, exception.stack);
    return throwError(() => exception);
  }
}
