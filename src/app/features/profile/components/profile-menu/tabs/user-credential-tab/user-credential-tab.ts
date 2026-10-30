import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { checkPasswordRequirements, passwordMatchValidator, passwordValidator } from '../../../../../../shared/validators/password.validator';
import { ChangePasswordRequest } from '../../../../../../models/user.model';
import { PasswordRequirementsComponent } from '../../../../../../shared/components/password-requirements-component/password-requirements-component';
import { PasswordInputComponent } from '../../../../../../shared/components/password-input-component/password-input-component';
import { AuthService } from '../../../../../../core/services/auth/auth.service';
import { UserService } from '../../../../../user/services/user.service';
import { withHttpErrorMessage } from '../../../../../../core/interceptors/http-error.cotext';

type EditableField = 'email' | null;

@Component({
    selector: 'app-user-credential-tab',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, PasswordRequirementsComponent, PasswordInputComponent],
    templateUrl: './user-credential-tab.html',
    styleUrl: './user-credential-tab.css',
})
export class UserCredentialTab {
    protected readonly authService = inject(AuthService);
    private userService = inject(UserService);
    private fb = inject(FormBuilder);

    isChangingPassword = signal<boolean>(false);
    editingField = signal<EditableField>(null);
    tempEmail = signal<string>('');

    passwordForm = this.fb.group({
        oldPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, passwordValidator()]],
        confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator('newPassword', 'confirmPassword') });

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

        this.userService.updateUser(
            { [field]: values[field] },
            withHttpErrorMessage('Non è stato possibile aggiornare l’indirizzo email.'),
        ).subscribe({
            next: () => this.cancelEdit(),
            error: () => { },
        });
    }

    togglePasswordForm(): void {
        this.isChangingPassword.update(prev => !prev);
        if (!this.isChangingPassword()) {
            this.passwordForm.reset();
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

        this.userService.changePassword(
            request,
            withHttpErrorMessage('Non è stato possibile cambiare la password. Verifica la password attuale e riprova.'),
        ).subscribe({
            next: () => {
                this.togglePasswordForm();
            },
            error: () => { },
        });
    }

    get newPasswordReqs() {
        const value = this.passwordForm.get('newPassword')?.value || '';
        return checkPasswordRequirements(value);
    }
}
