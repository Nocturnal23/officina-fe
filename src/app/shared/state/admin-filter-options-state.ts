import { DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Observable, Subject, catchError, finalize, switchMap, tap } from 'rxjs';
import { VehicleResponse } from '../../models/vehicle.model';

export class AdminFilterOptionsState {
    readonly vehicles = signal<VehicleResponse[]>([]);
    readonly vehiclesLoading = signal(false);
    readonly vehiclesError = signal(false);
    readonly selectedUserId = signal<number | null>(null);

    private readonly requests = new Subject<number | null>();

    constructor(
        destroyRef: DestroyRef,
        private readonly loadAllVehicles: () => Observable<VehicleResponse[]>,
        private readonly loadVehiclesForUser: (userId: number) => Observable<VehicleResponse[]>,
    ) {
        this.requests
            .pipe(
                switchMap((userId) => {
                    this.vehiclesLoading.set(true);
                    this.vehiclesError.set(false);

                    const request = userId === null
                        ? this.loadAllVehicles()
                        : this.loadVehiclesForUser(userId);

                    return request.pipe(
                        tap((vehicles) => this.vehicles.set(vehicles)),
                        catchError(() => {
                            this.vehiclesError.set(true);
                            return EMPTY;
                        }),
                        finalize(() => this.vehiclesLoading.set(false)),
                    );
                }),
                takeUntilDestroyed(destroyRef),
            )
            .subscribe();

        this.loadForUser(null);
    }

    loadForUser(userId: number | null): void {
        this.selectedUserId.set(userId);
        this.requests.next(userId);
    }

    retry(): void {
        this.requests.next(this.selectedUserId());
    }
}
