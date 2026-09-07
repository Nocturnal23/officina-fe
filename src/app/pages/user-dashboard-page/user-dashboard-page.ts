import { Component, inject, signal } from '@angular/core';
import { Auth } from '../../services/auth/auth';
import { Router } from '@angular/router';
import { ProfileMenu } from "../../layout/profile-menu/profile-menu";
import { Booking } from '../../services/booking/booking';
import { BookingResponse } from '../../models/booking.model';
import { BookingCard } from "../../layout/booking-card/booking-card";

@Component({
  selector: 'app-user-dashboard-page',
  imports: [ProfileMenu, BookingCard],
  templateUrl: './user-dashboard-page.html',
  styleUrl: './user-dashboard-page.css',
})
export class UserDashboardPage {
  protected readonly authService = inject(Auth);
  private router = inject(Router);
  private booking = inject(Booking);


  isMenuOpen = signal<boolean>(false);
  isProfileOpen = signal<boolean>(false);
  bookings = signal<BookingResponse[]>([]);
  showBookingCard = signal<boolean>(false);
  

  ngOnInit(): void {
    this.loadBookings();
  }

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

  openBookingCard(): void {
    this.showBookingCard.set(true);
  }

  closeBookingCard(): void {
    this.showBookingCard.set(false);
  }

  logout(): void {
    this.closeMenu();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private loadBookings() {
    this.booking.getBooking().subscribe({
      next: (data) => {
        this.bookings.set(data);
      },
      error: (err) => {
        console.log("Nessuna prenotazione: ", err);
      }
    })
  }
}
