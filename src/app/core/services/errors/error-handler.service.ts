import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  private readonly currentError = signal<string | null>(null);

  readonly errorMessage = this.currentError.asReadonly();

  handleError(error: unknown, fallbackMessage?: string): string {
    const message = getErrorMessage(error, fallbackMessage);
    console.error(message, error);
    this.currentError.set(message);
    return message;
  }

  clearError(): void {
    this.currentError.set(null);
  }
}

export function getErrorMessage(
  error: unknown,
  fallbackMessage = 'Si è verificato un errore. Riprova più tardi.',
): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallbackMessage;
  }

  const responseMessage = getResponseMessage(error.error);
  if (responseMessage && error.status < 500) {
    return responseMessage;
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
        : fallbackMessage;
  }
}

function getResponseMessage(body: unknown): string | null {
  if (typeof body === 'string' && body.trim()) {
    return body.trim();
  }

  if (typeof body !== 'object' || body === null || !('message' in body)) {
    return null;
  }

  const message = body.message;
  if (typeof message === 'string' && message.trim()) {
    return message.trim();
  }

  if (Array.isArray(message)) {
    const messages = message.filter(
      (entry): entry is string => typeof entry === 'string' && entry.trim().length > 0,
    );
    return messages.length > 0 ? messages.join(' ') : null;
  }

  return null;
}
