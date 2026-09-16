import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BookingResponse } from '../../models/booking.model';
import { BookingCardView } from '../../layout/booking-card-view/booking-card-view';
import { Booking } from '../../services/booking/booking';

@Component({
  selector: 'app-history-page',
  imports: [BookingCardView],
  templateUrl: './history-page.html',
  styleUrl: './history-page.css',
})
export class HistoryPage {
  private readonly router = inject(Router);
  private historyBooking = inject(Booking)

  historyBookings = signal<BookingResponse[]>([]);

  ngOnInit() {
    this.loadBookings();
  }

  goBackDashboard(): void {
    this.router.navigate(['user/dashboard']);
  }

  private loadBookings() {
    this.historyBooking.getBookingHistory().subscribe({
      next: (data) => {
        this.historyBookings.set(data);
      },
      error: (err) => {
        console.log("Nessuna prenotazione: ", err);
      }
    })
  }
}
