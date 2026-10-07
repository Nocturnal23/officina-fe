import { Component, inject, signal } from '@angular/core';
import { Auth } from '../../../../services/auth/auth';
import { CommonModule } from '@angular/common';
import { ChangePasswordRequest } from '../../../../models/user.model';

type EditableField = 'email' | 'password' | null;

@Component({
  selector: 'app-user-credential-tab',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-credential-tab.html',
  styleUrl: './user-credential-tab.css',
})
export class UserCredentialTab {
    protected readonly authService = inject(Auth);
    isChangingPassword = signal<boolean>(false);

    editingField = signal<EditableField>(null);
    tempEmail = signal<string>('');

    isAdmin(): boolean {
        return this.authService.currentUser()?.role === 'ADMIN';
    }

    startEdit(field: EditableField): void {
        const user = this.authService.currentUser();
        if (!user) return;

        if (field === 'email') this.tempEmail.set(user.email || '');

        this.editingField.set(field);
    }

    cancelEdit(): void {
        this.editingField.set(null);
    }

    saveField(field: 'email'): void {
        const user = this.authService.currentUser();
        if (!user) return;

        const values = {
            email: this.tempEmail(),
        };

        this.authService.updateUser({ [field]: values[field] }).subscribe({
            next: () => this.cancelEdit(),
            error: (error) => console.error(`Errore aggiornamento ${field}:`, error),
        });
    }

    togglePasswordForm(): void {
        this.isChangingPassword.update(prev => !prev);
    }
}

    submitPasswordChange() {
        if (this.passwordForm.invalid) {
            this.passwordForm.markAllAsTouched();
            return;
        }
        
        const request: ChangePasswordRequest = {
            oldPassword: this.passwordForm.value.oldPassword ?? '',
            newPassword: this.passwordForm.value.newPassword ?? ''
        };

        this.authService.changePassword(request).subscribe({
            next: () => {
                this.togglePasswordForm();
            },
            error: (error) => {
                console.error('Errore cambio password:', error);
            }
        });
    }

