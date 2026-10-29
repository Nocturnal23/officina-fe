import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ErrorNotification } from './shared/components/error-notification/error-notification';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, ErrorNotification],
    templateUrl: './app.html',
    styleUrl: './app.css'
})
export class App {
    protected readonly title = signal('officina-fe');
}
