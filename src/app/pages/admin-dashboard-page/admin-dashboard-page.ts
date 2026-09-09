import { Component, inject, signal } from '@angular/core';
import { Auth } from '../../services/auth/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [],
  templateUrl: './admin-dashboard-page.html',
  styleUrl: './admin-dashboard-page.css',
})
export class AdminDashboardPage {
  authService = inject(Auth);
  private router = inject(Router);
  isManagerOpen = signal<boolean>(false)

  toggleManager(): void {
    this.isManagerOpen.update(open => !open);
  }

  closeManager(): void {
    this.isManagerOpen.set(false);
  }

  goToServices() {
    this.closeManager();
    this.router.navigate(['admin/services'])
  }

  logout() {
    this.closeManager();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}