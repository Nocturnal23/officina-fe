import { Component, computed, inject, signal } from '@angular/core';
import { Auth } from '../../services/auth/auth';
import { Router } from '@angular/router';
import { Booking } from '../../services/booking/booking';
import { BOOKING_TABS, BookingResponse, BookingStatus, StatusChangeEvent } from '../../models/booking.model';
import { CommonModule } from '@angular/common';
import { BookingCardView } from '../../layout/booking-card-view/booking-card-view';

export type AdminBookingAction = 'ACCEPT' | 'REFUSE' | 'ADVANCE';

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [CommonModule, BookingCardView],
  templateUrl: './admin-dashboard-page.html',
  styleUrl: './admin-dashboard-page.css',
})
export class AdminDashboardPage {
  authService = inject(Auth);
  private router = inject(Router);
  private booking = inject(Booking);

  isManagerOpen = signal<boolean>(false)
  bookings = signal<BookingResponse[]>([]);

  readonly tabs = BOOKING_TABS;
  activeTab = signal<BookingStatus>(BookingStatus.PENDING);

  filteredBookings = computed(() =>
    this.bookings().filter(b => b.status === this.activeTab())
  );

  selectTab(status: BookingStatus): void {
    this.activeTab.set(status);
  }

  getCountByStatus(status: BookingStatus): number {
    return this.bookings().filter(b => b.status === status).length;
  }

  ngOnInit(): void {
    this.loadBookings();
  }

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

  private loadBookings() {
    this.booking.getAllBooking().subscribe({
      next: (data) => {
        this.bookings.set(data);
      },
      error: (err) => {
        console.log("Nessuna prenotazione: ", err);
      }
    })
  }

  handleStatusChange(event: StatusChangeEvent): void {
    this.booking.updateBookingStatus(event.id, event.status).subscribe({
      next: (updatedBooking) => {
        this.bookings.update(items =>
          items.map(b => (b.id === updatedBooking.id ? updatedBooking : b))
        );
      },
      error: (err) => console.error("Errore update stato:", err)
    });
  }

  deleteBooking(bookingId: number): void {
    this.booking.refuseBooking(bookingId).subscribe({
      next: () => {
        this.bookings.update(items => items.filter(b => b.id !== bookingId));
      },
      error: (err) => console.error("Errore cancellazione:", err)
    });
  }

}