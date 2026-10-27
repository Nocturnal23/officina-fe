import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorHandlerService } from '../services/errors/error-handler.service';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const errorHandler = inject(ErrorHandlerService);

  return next(request).pipe(
    catchError((error: unknown) => {
      errorHandler.handleError(error);
      return throwError(() => error);
    }),
  );
};
