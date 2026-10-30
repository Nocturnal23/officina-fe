import { DestroyRef, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject, catchError, debounceTime, finalize, map, of, switchMap, tap } from 'rxjs';
import { ListFilterCriteria } from '../../models/list-filters.model';
import { VehicleResponse } from '../../models/vehicle.model';

export class HistoryFilterState {
    readonly filters = signal<ListFilterCriteria>({});
    private readonly currentVehicles = signal<VehicleResponse[]>([]);
    private readonly historicalMatches = signal<VehicleResponse[]>([]);
    private readonly searchTerms = new Subject<string>();
    readonly vehiclesLoading = signal(false);
    readonly vehiclesError = signal(false);
    readonly vehicleSearchLoading = signal(false);
    readonly vehicleSearchError = signal(false);
    private readonly loadCurrentVehicles: () => Observable<VehicleResponse[]> | null;
    private readonly searchVehicleRequest?: (query: string) => Observable<VehicleResponse[]>;
    private currentVehicleSearch = '';

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
        searchVehicles?: (query: string) => Observable<VehicleResponse[]>,
    ) {
        this.destroyRef = destroyRef;
        this.loadCurrentVehicles = loadCurrentVehicles;
        this.searchVehicleRequest = searchVehicles;
        this.loadVehicles();

        this.searchTerms
            .pipe(
                map((query) => query.trim()),
                debounceTime(300),
                tap(() => this.historicalMatches.set([])),
                switchMap((query) => {
                    this.vehicleSearchError.set(false);
                    if (!this.searchVehicleRequest || query.length < 2) {
                        this.vehicleSearchLoading.set(false);
                        return of([]);
                    }

                    this.currentVehicleSearch = query;
                    this.vehicleSearchLoading.set(true);
                    return this.searchVehicleRequest(query).pipe(
                        catchError(() => {
                            this.vehicleSearchError.set(true);
                            return of([]);
                        }),
                        finalize(() => this.vehicleSearchLoading.set(false)),
                    );
                }),
                takeUntilDestroyed(destroyRef),
            )
            .subscribe((vehicles) => this.historicalMatches.set(vehicles));

    }

    private readonly destroyRef: DestroyRef;

    retryVehicles(): void {
        this.loadVehicles();
    }

    retryVehicleSearch(): void {
        if (this.currentVehicleSearch) {
            this.searchTerms.next(this.currentVehicleSearch);
        }
    }

    applyFilters(filters: ListFilterCriteria): void {
        this.filters.set(filters);
        this.onFiltersApplied();
    }

    searchVehicles(query: string): void {
        this.searchTerms.next(query);
    }

    private loadVehicles(): void {
        const request = this.loadCurrentVehicles();
        if (!request) {
            this.vehiclesLoading.set(false);
            return;
        }

        this.vehiclesLoading.set(true);
        this.vehiclesError.set(false);
        request
            .pipe(
                catchError(() => {
                    this.vehiclesError.set(true);
                    return of([]);
                }),
                finalize(() => this.vehiclesLoading.set(false)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((vehicles) => this.currentVehicles.set(vehicles));
    }
}
