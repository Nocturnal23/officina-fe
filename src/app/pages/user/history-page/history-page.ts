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
import { JobService } from '../../../features/jobs/services/job.service';
import { JobResponse } from '../../../models/job.model';
import { withLocalHttpErrorHandling } from '../../../core/interceptors/http-error.cotext';

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
    private readonly jobService = inject(JobService);
    readonly filterState = new HistoryFilterState(
        inject(DestroyRef),
        () => {
            const userId = this.authService.currentUser()?.id;
            return userId === undefined
                ? null
                : this.vehicleService.getVehiclesByUser(
                    userId,
                    withLocalHttpErrorHandling(),
                );
        },
        () => {
            this.currentPage.set(0);
            this.loadData();
        },
        (query) => this.bookingService.searchVehiclesInHistory(
            query,
            withLocalHttpErrorHandling(),
        ),
    );

    currentFilters = signal<BookingStatus[]>([BookingStatus.COMPLETED, BookingStatus.REFUSED]);
    currentListFilters = this.filterState.filters;
    vehicles = this.filterState.vehicleOptions;
    jobs = signal<JobResponse[] | null>(null);
    jobError = signal(false);
    loading = signal(true);
    loadFailed = signal(false);

    BookingStatuBut = BookingStatus;

    ngOnInit() {
        this.loadJobs();
        this.loadData();
    }

    loadJobs(): void {
        this.jobs.set(null);
        this.jobError.set(false);
        this.jobService.getHistoryJobs(withLocalHttpErrorHandling()).subscribe({
            next: (jobs) => this.jobs.set(jobs),
            error: () => this.jobError.set(true),
        });
    }

    goBackDashboard(): void {
        this.router.navigate(['user/dashboard']);
    }

    protected loadData() {
        this.loading.set(true);
        this.loadFailed.set(false);
        this.bookingService.getHistory(
            this.currentPage(),
            this.pageSize(),
            this.currentFilters(),
            this.currentListFilters(),
            withLocalHttpErrorHandling(),
        ).subscribe({
            next: (data) => {
                this.updatePaginationState(data);
                this.loading.set(false);
            },
            error: () => {
                this.loadFailed.set(true);
                this.loading.set(false);
            },
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
