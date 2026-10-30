import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserRequest } from '../../../models/user.model';
import { PasswordInputComponent } from '../../../shared/components/password-input-component/password-input-component';
import { PasswordRequirementsComponent } from '../../../shared/components/password-requirements-component/password-requirements-component';
import { passwordValidator, checkPasswordRequirements } from '../../../shared/validators/password.validator';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LoginRequest } from '../../../models/auth.model';
import { getErrorMessage } from '../../../core/services/errors/error-handler.service';
import { withLocalHttpErrorHandling } from '../../../core/interceptors/http-error.cotext';


@Component({
    selector: 'app-authentication-page',
    imports: [ReactiveFormsModule, PasswordRequirementsComponent, PasswordInputComponent],
    templateUrl: './authentication-page.html',
    styleUrl: './authentication-page.css',
})
export class AuthenticationPage {
    //Servizi
    private formBuilder = inject(FormBuilder);
    private authService = inject(AuthService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    //Signals per variabili reattive.
    isLogin = signal<boolean>(true);
    errorMessage = signal<string | null>(null);
    successMessage = signal<string | null>(null);
    showPassword = signal<boolean>(false);

    ngOnInit(): void {
        this.route.url.subscribe(() => {
            const url = this.router.url;
            this.isLogin.set(url.includes('/login'));
        });
    }

    goToLogin(): void {
        this.router.navigate(['/login']);
    }

    goToRegister(): void {
        this.router.navigate(['/register']);
    }

    //Logica elementi pagina.
    //Alternare registra/accedi.
    toggleMode(): void {
        const nextRoute = this.isLogin() ? '/register' : '/login';
        this.router.navigate([nextRoute]);
    }

    togglePasswordVisibility(): void {
        this.showPassword.update(val => !val);
    }

    //Form login
    loginForm = this.formBuilder.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]]
    });

    //Metodo login
    onLoginSubmit(): void {
        //Controllo e gestione errori.
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }
        this.errorMessage.set(null);

        //Recupero credenzaili dal form.
        const credentials: LoginRequest = this.loginForm.getRawValue();

        this.authService.login(credentials, withLocalHttpErrorHandling()).subscribe({
            next: (response) => {
                if (response.user.role === 'ADMIN') {
                    this.router.navigate(['/admin/dashboard']);
                } else {
                    this.router.navigate(['/user/dashboard']);
                }
            },
            error: (error: unknown) => {
                this.errorMessage.set(
                    error instanceof HttpErrorResponse && error.status === 401
                        ? 'Email o password non valide.'
                        : getErrorMessage(error, 'Non è stato possibile accedere. Riprova.'),
                );
            }
        });
    };

    //Form registra
    registerForm = this.formBuilder.nonNullable.group({
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9. ()-]{7,25}$/)]],
        password: ['', [Validators.required, passwordValidator()]]
    });

    //Metodo registra
    onRegisterSubmit(): void {
        if (this.registerForm.invalid) {
            this.registerForm.markAllAsTouched();
            return;
        }

        this.errorMessage.set(null);
        const userData: UserRequest = this.registerForm.getRawValue();

        this.authService.register(userData, withLocalHttpErrorHandling()).subscribe({
            next: (response) => {
                this.successMessage.set(`Registrazione completata per ${response.email}! Ora puoi accedere.`);
                this.registerForm.reset();
                this.isLogin.set(true);
                this.router.navigate(['/login']);
            },
            error: (error: unknown) => {
                this.errorMessage.set(
                    getErrorMessage(error, 'Non è stato possibile completare la registrazione. Riprova.'),
                );
            }
        });
    }

    get registerPasswordReqs() {
        const value = this.registerForm.get('password')?.value || '';
        return checkPasswordRequirements(value);
    }
}
