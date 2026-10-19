import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BookingResponse, BookingStatus } from '../../../models/booking.model';
import { CommonModule } from '@angular/common';
import { Paginator } from '../../../shared/components/paginator/paginator';
import { BasePaginatorComponent } from '../../../core/base/BasePaginatorComponent';
import { BookingCardView } from '../../../features/booking/components/booking-card-view/booking-card-view';
import { BookingService } from '../../../features/booking/services/booking.service';
import { ListFilters } from '../../../shared/components/list-filters/list-filters';
import { ListFilterCriteria } from '../../../models/list-filters.model';
import { VehicleResponse } from '../../../models/vehicle.model';
import { VehicleService } from '../../../features/vehicles/services/vehicle.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { DestroyRef } from '@angular/core';
import { EMPTY, Subject, catchError, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  private readonly destroyRef = inject(DestroyRef);
  private readonly vehicleSearchTerms = new Subject<string>();

  currentFilters = signal<BookingStatus[]>([BookingStatus.COMPLETED, BookingStatus.REFUSED]);
  currentListFilters = signal<ListFilterCriteria>({});
  private readonly currentVehicles = signal<VehicleResponse[]>([]);
  private readonly historicalVehicleMatches = signal<VehicleResponse[]>([]);
  vehicles = computed(() => {
    const vehiclesById = new Map<number, VehicleResponse>();
    for (const vehicle of [...this.currentVehicles(), ...this.historicalVehicleMatches()]) {
      vehiclesById.set(vehicle.id, vehicle);
    }
    return [...vehiclesById.values()];
  });

  BookingStatuBut = BookingStatus;

  ngOnInit() {
    const userId = this.authService.currentUser()?.id;
    if (userId !== undefined) {
      this.vehicleService.getVehiclesByUser(userId).subscribe({
        next: (vehicles) => this.currentVehicles.set(vehicles),
        error: (err) => console.error('Errore durante il recupero dei veicoli utente:', err),
      });
    }

    this.vehicleSearchTerms
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.historicalVehicleMatches.set([])),
        switchMap((query) => {
          const normalizedQuery = query.trim();
          if (normalizedQuery.length < 2) return EMPTY;

          return this.bookingService.searchVehiclesInHistory(normalizedQuery).pipe(
            catchError((err) => {
              console.error('Errore durante la ricerca dei veicoli nello storico:', err);
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((vehicles) => this.historicalVehicleMatches.set(vehicles));

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

  onListFiltersChange(filters: ListFilterCriteria): void {
    this.currentListFilters.set(filters);

    this.currentPage.set(0);

    this.loadData();
  }

  onVehicleSearch(query: string): void {
    this.vehicleSearchTerms.next(query);
  }
}
