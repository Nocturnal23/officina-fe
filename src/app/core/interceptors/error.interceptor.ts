import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorHandlerService } from '../services/errors/error-handler.service';
import { HTTP_ERROR_FALLBACK_MESSAGE, HTTP_ERROR_NOTIFICATION_ENABLED, HTTP_ERROR_DEDUPLICATION_KEY } from './http-error.cotext';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
    const errorHandler = inject(ErrorHandlerService);

    return next(request).pipe(
        catchError((error: unknown) => {
            if (!request.context.get(HTTP_ERROR_NOTIFICATION_ENABLED)) {
                return throwError(() => error);
            }

            const fallbackMessage = request.context.get(HTTP_ERROR_FALLBACK_MESSAGE) ?? undefined;
            const deduplicationKey = request.context.get(HTTP_ERROR_DEDUPLICATION_KEY) ?? undefined;

            errorHandler.handleError(error, fallbackMessage, deduplicationKey);

            return throwError(() => error);
        }),
    );
};
