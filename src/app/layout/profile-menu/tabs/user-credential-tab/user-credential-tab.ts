import { Component, inject, signal } from '@angular/core';
import { Auth } from '../../../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-credential-tab',
  imports: [CommonModule],
  templateUrl: './user-credential-tab.html',
  styleUrl: './user-credential-tab.css',
})
export class UserCredentialTab {
    protected readonly authService = inject(Auth);
    isChangingPassword = signal<boolean>(false);

    isAdmin(): boolean {
        return this.authService.currentUser()?.role === 'ADMIN';
    }

    togglePasswordForm(): void {
        this.isChangingPassword.update(prev => !prev);
    } 

    onDeleteAccount(): void {
        const confirmDelete = confirm('Sei sicuro di voler eliminare definitivamente il tuo account? L\'azione è irreversibile.');
        if (confirmDelete) {
            console.log('Eliminazione account...');
            //TODO: chiamata al backend per delete/disattivazione account
        }
    }
}



