// Origine: z:\Progetti\Officina\officina-fe\src\app\core\services\errors\error-handler.service.ts
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';

export interface ErrorNotificationMessage {
    id: number;
    message: string;
    deduplicationKey?: string;
}

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
    private readonly currentErrors = signal<ErrorNotificationMessage[]>([]);
    readonly errorNotifications = this.currentErrors.asReadonly();

    private nextId = 0;

    handleError(error: unknown, contextualMessage?: string, deduplicationKey?: string,): string {
        const message = getErrorMessage(error, contextualMessage);
        console.error(message, error);

        this.currentErrors.update(errors => {
            if (
                deduplicationKey &&
                errors.some(
                    notification => notification.deduplicationKey === deduplicationKey,
                )
            ) {
                return errors;
            }

            return [
                ...errors,
                { id: ++this.nextId, message, deduplicationKey },
            ];
        });
        return message;
    }

    dismissError(id: number): void {
        this.currentErrors.update(errors =>
            errors.filter(error => error.id !== id),
        );
    }
}

export function getErrorMessage(
    error: unknown,
    contextualMessage?: string,
): string {
    if (contextualMessage) {
        return contextualMessage;
    }

    if (!(error instanceof HttpErrorResponse)) {
        return 'Si è verificato un errore. Riprova più tardi.';
    }

    if (error.status === 0) {
        return 'Impossibile raggiungere il server. Controlla la connessione e riprova.';
    }

    switch (error.status) {
        case 400:
            return 'La richiesta non è valida. Controlla i dati inseriti.';
        case 401:
            return 'Non sei autorizzato. Accedi di nuovo e riprova.';
        case 403:
            return 'Non hai i permessi necessari per eseguire questa operazione.';
        case 404:
            return 'La risorsa richiesta non è stata trovata.';
        case 409:
            return 'L’operazione non può essere completata perché i dati sono in conflitto.';
        case 422:
            return 'I dati inseriti non sono validi.';
        default:
            return error.status >= 500
                ? 'Si è verificato un errore del server. Riprova più tardi.'
                : 'Si è verificato un errore. Riprova più tardi.';
    }
}
