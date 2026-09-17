import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BookingResponse, BookingStatus } from '../../models/booking.model';
import { BookingCardView } from '../../layout/booking-card-view/booking-card-view';
import { Booking } from '../../services/booking/booking';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-history-page',
  imports: [BookingCardView, CommonModule],
  templateUrl: './history-page.html',
  styleUrl: './history-page.css',
})
export class HistoryPage {
  private readonly router = inject(Router);
  private bookingService = inject(Booking)

  historyBookings = signal<BookingResponse[]>([]);
  currentPage = signal<number>(0);
  pageSize = signal<number>(3);
  isLastPage = signal<boolean>(true);
  totalPages = signal<number>(0);
  currentFilters = signal<BookingStatus[]>([BookingStatus.COMPLETED, BookingStatus.REFUSED]);

  BookingStatuBut = BookingStatus;

  ngOnInit() {
    this.loadBookings();
  }

  goBackDashboard(): void {
    this.router.navigate(['user/dashboard']);
  }

  private loadBookings() {
    this.bookingService.getHistory(
      this.currentPage(),
      this.pageSize(),
      this.currentFilters()
    ).subscribe({
      next: (data) => {
        this.historyBookings.set(data.content);
        this.isLastPage.set(data.last);
        this.totalPages.set(data.totalPages);
      },
      error: (err) => {
        console.log("Nessuna prenotazione: ", err);
      }
    })
  }

  nextPage() {
    if (!this.isLastPage()) {
      this.currentPage.update(p => p + 1);
      this.loadBookings();
    }
  }

  prevPage() {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
      this.loadBookings();
    }
  }

  setFilter(status: BookingStatus | 'ALL') {
    if (status === 'ALL') {
      this.currentFilters.set([BookingStatus.COMPLETED, BookingStatus.REFUSED]);
    } else {
      this.currentFilters.set([status]);
    }

    this.currentPage.set(0); 
    this.loadBookings();
  }
}
