import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-not-found',
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    goBackDashboard(){
        const role = this.authService.currentUser()?.role;

        const destination = role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard'

        this.router.navigate([destination]);
    }
}
