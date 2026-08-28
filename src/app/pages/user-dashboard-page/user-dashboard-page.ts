import { Component, inject, signal } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { ProfileMenu } from "../../layout/profile-menu/profile-menu";

@Component({
  selector: 'app-user-dashboard-page',
  imports: [ProfileMenu],
  templateUrl: './user-dashboard-page.html',
  styleUrl: './user-dashboard-page.css',
})
export class UserDashboardPage {
  protected readonly authService = inject(Auth);
  private router = inject(Router);
  isMenuOpen = signal<boolean>(false);
  isProfileOpen = signal<boolean>(false);

  toggleMenu(): void {
    this.isMenuOpen.update(open => !open);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  openProfile(): void {
    this.closeMenu();
    this.isProfileOpen.set(true);
  }

  closeProfile(): void {
    this.isProfileOpen.set(false);
  }

  logout(): void {
    this.closeMenu();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
