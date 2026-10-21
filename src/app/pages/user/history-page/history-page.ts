import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BookingResponse, BookingStatus } from '../../../models/booking.model';
import { CommonModule } from '@angular/common';
import { Paginator } from '../../../shared/components/paginator/paginator';
import { BasePaginatorComponent } from '../../../core/base/BasePaginatorComponent';
import { BookingCardView } from '../../../features/booking/components/booking-card-view/booking-card-view';
import { BookingService } from '../../../features/booking/services/booking.service';
import { ListFilters } from '../../../shared/components/list-filters/list-filters';
import { VehicleService } from '../../../features/vehicles/services/vehicle.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { HistoryFilterState } from '../../../shared/state/history-filter-state';

@Component({
  selector: 'app-history-page',
  imports: [BookingCardView, CommonModule, Paginator, ListFilters],
  templateUrl: './history-page.html',
  styleUrl: './history-page.css',
})
export class HistoryPage extends BasePaginatorComponent<BookingResponse> {
  private readonly router = inject(Router);
  private readonly bookingService = inject(BookingService);
  private readonly vehicleService = inject(VehicleService);
  private readonly authService = inject(AuthService);
  readonly filterState = new HistoryFilterState(
    inject(DestroyRef),
    () => {
      const userId = this.authService.currentUser()?.id;
      return userId === undefined ? null : this.vehicleService.getVehiclesByUser(userId);
    },
    () => {
      this.currentPage.set(0);
      this.loadData();
    },
    'Errore durante il recupero dei veicoli utente:',
    (query) => this.bookingService.searchVehiclesInHistory(query),
    'Errore durante la ricerca dei veicoli nello storico:',
  );

  currentFilters = signal<BookingStatus[]>([BookingStatus.COMPLETED, BookingStatus.REFUSED]);
  currentListFilters = this.filterState.filters;
  vehicles = this.filterState.vehicleOptions;

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
      this.currentListFilters()
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
