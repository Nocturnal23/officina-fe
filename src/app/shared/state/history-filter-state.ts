import { DestroyRef, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject, catchError, debounceTime, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { ListFilterCriteria } from '../../models/list-filters.model';
import { VehicleResponse } from '../../models/vehicle.model';

export class HistoryFilterState {
  readonly filters = signal<ListFilterCriteria>({});
  private readonly currentVehicles = signal<VehicleResponse[]>([]);
  private readonly historicalMatches = signal<VehicleResponse[]>([]);
  private readonly searchTerms = new Subject<string>();

  readonly vehicleOptions = computed(() => {
    const vehiclesById = new Map<number, VehicleResponse>();
    for (const vehicle of [...this.currentVehicles(), ...this.historicalMatches()]) {
      vehiclesById.set(vehicle.id, vehicle);
    }
    return [...vehiclesById.values()];
  });

  constructor(
    destroyRef: DestroyRef,
    loadCurrentVehicles: () => Observable<VehicleResponse[]> | null,
    private readonly onFiltersApplied: () => void,
    private readonly currentVehiclesErrorMessage: string,
    searchVehicles?: (query: string) => Observable<VehicleResponse[]>,
    private readonly searchErrorMessage = 'Errore durante la ricerca dei veicoli nello storico:',
  ) {
    const currentVehiclesRequest = loadCurrentVehicles();
    currentVehiclesRequest
      ?.pipe(
        catchError((error) => {
          console.error(this.currentVehiclesErrorMessage, error);
          return of([]);
        }),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe((vehicles) => this.currentVehicles.set(vehicles));

    this.searchTerms
      .pipe(
        map((query) => query.trim()),
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.historicalMatches.set([])),
        switchMap((query) => {
          if (!searchVehicles || query.length < 2) return of([]);

          return searchVehicles(query).pipe(
            catchError((error) => {
              console.error(this.searchErrorMessage, error);
              return of([]);
            }),
          );
        }),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe((vehicles) => this.historicalMatches.set(vehicles));
  }

  applyFilters(filters: ListFilterCriteria): void {
    this.filters.set(filters);
    this.onFiltersApplied();
  }

  searchVehicles(query: string): void {
    this.searchTerms.next(query);
  }
}
