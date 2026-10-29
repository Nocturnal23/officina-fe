import { HttpContext, HttpContextToken } from '@angular/common/http';

export const HTTP_ERROR_FALLBACK_MESSAGE =
    new HttpContextToken<string | null>(() => null);

export const HTTP_ERROR_NOTIFICATION_ENABLED =
    new HttpContextToken<boolean>(() => true);

export const HTTP_ERROR_DEDUPLICATION_KEY =
    new HttpContextToken<string | null>(() => null);

export function withHttpErrorMessage(message: string, errorKey?: string): HttpContext {
    return new HttpContext()
        .set(HTTP_ERROR_FALLBACK_MESSAGE, message)
        .set(HTTP_ERROR_DEDUPLICATION_KEY, errorKey ?? null);
}

export function withLocalHttpErrorHandling(): HttpContext {
    return new HttpContext().set(HTTP_ERROR_NOTIFICATION_ENABLED, false);
}