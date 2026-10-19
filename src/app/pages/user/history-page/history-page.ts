import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BookingResponse, BookingStatus } from '../../../models/booking.model';
import { CommonModule } from '@angular/common';
import { Paginator } from '../../../shared/components/paginator/paginator';
import { BasePaginatorComponent } from '../../../core/base/BasePaginatorComponent';
import { BookingCardView } from '../../../features/booking/components/booking-card-view/booking-card-view';
import { BookingService } from '../../../features/booking/services/booking.service';
import { ListFilters } from '../../../shared/components/list-filters/list-filters';
import { ListFilterCriteria } from '../../../models/list-filters.model';

@Component({
  selector: 'app-history-page',
  imports: [BookingCardView, CommonModule, Paginator, ListFilters],
  templateUrl: './history-page.html',
  styleUrl: './history-page.css',
})
export class HistoryPage extends BasePaginatorComponent<BookingResponse> {
  private readonly router = inject(Router);
  private bookingService = inject(BookingService)

  currentFilters = signal<BookingStatus[]>([BookingStatus.COMPLETED, BookingStatus.REFUSED]);
  currentListFilters = signal<ListFilterCriteria>({});

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
      this.currentFilters(),
      this.currentListFilters().date
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

  onListFiltersChange(filters: ListFilterCriteria): void {
    this.currentListFilters.set(filters);

    this.currentPage.set(0);

    this.loadData();
  }
}
