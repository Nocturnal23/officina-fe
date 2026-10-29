import { Component, inject } from '@angular/core';
import { ErrorHandlerService } from '../../../core/services/errors/error-handler.service';

@Component({
    selector: 'app-error-notification',
    templateUrl: './error-notification.html',
    styleUrl: './error-notification.css',
})
export class ErrorNotification {
    private readonly errorHandler = inject(ErrorHandlerService);
    readonly notifications = this.errorHandler.errorNotifications;

    dismiss(id: number): void {
        this.errorHandler.dismissError(id);
    }
}
