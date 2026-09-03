import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../../../services/auth/auth';
import { UserResponse } from '../../../../models/user.model';
import { Router } from '@angular/router';

type EditableField = 'firstName' | 'lastName' | 'phoneNumber' | null;

@Component({
    selector: 'app-user-info-tab',
    imports: [CommonModule, FormsModule],
    templateUrl: './user-info-tab.html',
    styleUrl: './user-info-tab.css',
})
export class UserInfoTab {
    protected readonly authService = inject(Auth);
    private readonly router = inject(Router);

    // Campo attualmente in modifica
    editingField = signal<EditableField>(null);

    // Valori temporanei per gli input durante la modifica
    tempFirstName = signal<string>('');
    tempLastName = signal<string>('');
    tempPhoneNumber = signal<string>('');

    get isAdmin(): boolean {
        return this.authService.currentUser()?.role === 'ADMIN'
    }

    startEdit(field: EditableField): void {
        const user = this.authService.currentUser();
        if (!user) return;

        if (field === 'firstName') this.tempFirstName.set(user.firstName || '');
        if (field === 'lastName') this.tempLastName.set(user.lastName || '');
        if (field === 'phoneNumber') this.tempPhoneNumber.set(user.phoneNumber || '');

        this.editingField.set(field);
    }

    cancelEdit(): void {
        this.editingField.set(null);
    }

    saveField(field: 'firstName' | 'lastName' | 'phoneNumber'): void {
        const user = this.authService.currentUser();
        if (!user) return;

        const values = {
            firstName: this.tempFirstName(),
            lastName: this.tempLastName(),
            phoneNumber: this.tempPhoneNumber(),
        };

        this.authService.updateUser({ [field]: values[field] }).subscribe({
            next: () => this.cancelEdit(),
            error: (error) => console.error(`Errore aggiornamento ${field}:`, error),
        });
    }

    deleteUser() : void {
        const confirmed = confirm('Sei sicuro di voler eliminare definitivamente il tuo profilo? Questa azione è irreversibile.');
        if (!confirmed) return;

        this.authService.deleteUser().subscribe({
            next: () => {
                this.authService.logout();
                this.router.navigate(['/login']);
            },
            error: (err) => console.error('Errore durante l\'eliminazione del profilo:', err)
        });
    }
}
