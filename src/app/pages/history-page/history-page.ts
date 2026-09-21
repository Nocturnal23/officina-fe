import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BookingResponse, BookingStatus } from '../../models/booking.model';
import { BookingCardView } from '../../layout/booking-card-view/booking-card-view';
import { Booking } from '../../services/booking/booking';
import { CommonModule } from '@angular/common';
import { Paginator } from '../../layout/paginator/paginator';
import { BasePaginatorComponent } from '../../abstract/BasePaginatorComponent';

@Component({
  selector: 'app-history-page',
  imports: [BookingCardView, CommonModule, Paginator],
  templateUrl: './history-page.html',
  styleUrl: './history-page.css',
})
export class HistoryPage extends BasePaginatorComponent<BookingResponse> {
  private readonly router = inject(Router);
  private bookingService = inject(Booking)

  // historyBookings = signal<BookingResponse[]>([]);
  currentFilters = signal<BookingStatus[]>([BookingStatus.COMPLETED, BookingStatus.REFUSED]);

  BookingStatuBut = BookingStatus;

  ngOnInit() {
    this.loadData();
  }

  goBackDashboard(): void {
    this.router.navigate(['user/dashboard']);
  }

  protected loadData() {
    this.bookingService.getHistory(
      this.currentPage(),
      this.pageSize(),
      this.currentFilters()
    ).subscribe({
      next: (data) => this.updatePaginationState(data),
      error: (err) => console.log("Errore: ", err)
    });
  }

  setFilter(status: BookingStatus | 'ALL') {
    if (status === 'ALL') {
      this.currentFilters.set([BookingStatus.COMPLETED, BookingStatus.REFUSED]);
    } else {
      this.currentFilters.set([status]);
    }

    this.currentPage.set(0); 
    this.loadData();
  }
}
