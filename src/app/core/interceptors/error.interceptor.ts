import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { ErrorHandlerService } from '../services/errors/error-handler.service';
import { HTTP_ERROR_FALLBACK_MESSAGE, HTTP_ERROR_NOTIFICATION_ENABLED, HTTP_ERROR_DEDUPLICATION_KEY } from './http-error.cotext';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
    const errorHandler = inject(ErrorHandlerService);
    const auth = inject(AuthService);
    const router = inject(Router);

    return next(request).pipe(
        catchError((error: unknown) => {
            const isAuthenticationRequest = request.url.includes('/api/auth');
            if (
                error instanceof HttpErrorResponse &&
                error.status === 401 &&
                request.headers.has('Authorization') &&
                !isAuthenticationRequest
            ) {
                if (auth.getToken()) {
                    auth.logout();
                    router.navigate(['/unauthorized'], { replaceUrl: true });
                }

                return throwError(() => error);
            }

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
