import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { LoginRequest, UserRequest } from '../../models/user.model';

@Component({
  selector: 'app-authentication-page',
  imports: [ReactiveFormsModule],
  templateUrl: './authentication-page.html',
  styleUrl: './authentication-page.css',
})
export class AuthenticationPage {
  //Servizi
  private formBuilder = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);

  //Signals per variabili reattive.
  isLogin = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  //Logica elementi pagina.
  //Alternare registra/accedi.
  toggleMode(): void {
    this.isLogin.update(val => !val);
    this.errorMessage.set(null);
    this.successMessage.set(null);
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

    this.authService.login(credentials).subscribe({
      next: (user) => {
        if (user.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/user/dashboard']);
        }
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Credenziali non valide');
      }
    });
  };

  //Form registra
  registerForm = this.formBuilder.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9. ()-]{7,25}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  //Metodo registra
  onRegisterSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    const userData: UserRequest = this.registerForm.getRawValue();

    this.authService.register(userData).subscribe({
      next: (response) => {
        this.successMessage.set(`Registrazione completata per ${response.email}! Ora puoi accedere.`);
        this.registerForm.reset();
        this.isLogin.set(true);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Errore durante la registrazione');
      }
    });
  }
}
