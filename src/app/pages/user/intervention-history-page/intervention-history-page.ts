import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Paginator } from '../../../shared/components/paginator/paginator';
import { InterventionHistoryResponse } from '../../../models/intervention.models';
import { BookingStatus } from '../../../models/booking.model';
import { CommonModule } from '@angular/common';
import { BasePaginatorComponent } from '../../../core/base/BasePaginatorComponent';
import { InterventionCardView } from '../../../features/intervention/components/intervention-card-view/intervention-card-view';
import { InterventionService } from '../../../features/intervention/services/intervention.service';
import { ListFilters } from '../../../shared/components/list-filters/list-filters';
import { AuthService } from '../../../core/services/auth/auth.service';
import { VehicleService } from '../../../features/vehicles/services/vehicle.service';
import { HistoryFilterState } from '../../../shared/state/history-filter-state';
import { JobService } from '../../../features/jobs/services/job.service';
import { JobResponse } from '../../../models/job.model';
import { UserService } from '../../../features/user/services/user.service';
import { PagedOptionsState } from '../../../shared/state/paged-options-state';
import { UserResponse } from '../../../models/user.model';
import { withLocalHttpErrorHandling } from '../../../core/interceptors/http-error.cotext';

@Component({
    selector: 'app-intervention-history-page',
    imports: [Paginator, CommonModule, InterventionCardView, ListFilters],
    templateUrl: './intervention-history-page.html',
    styleUrl: './intervention-history-page.css',
})
export class InterventionHistoryPage extends BasePaginatorComponent<InterventionHistoryResponse> {
    private readonly router = inject(Router);
    private readonly interventionService = inject(InterventionService);
    private readonly authService = inject(AuthService);
    private readonly vehicleService = inject(VehicleService);
    private readonly jobService = inject(JobService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly userService = inject(UserService);

    readonly userOptions = new PagedOptionsState<UserResponse>(
        this.destroyRef,
        (page, size, query) =>
            this.userService.getAllUsers(
                page,
                size,
                query || undefined,
                withLocalHttpErrorHandling(),
            ),
    );

    currentFilters = signal<BookingStatus[]>([BookingStatus.COMPLETED, BookingStatus.REFUSED]);
    jobs = signal<JobResponse[] | null>(null);
    jobError = signal(false);

    filterState!: HistoryFilterState;
    currentListFilters!: HistoryFilterState['filters'];
    vehicles!: HistoryFilterState['vehicleOptions'];
    loading = signal(true);
    loadFailed = signal(false);

    isAdmin = input(false);

    BookingStatuBut = BookingStatus;

    ngOnInit() {
        this.filterState = new HistoryFilterState(
            this.destroyRef,
            () => {
                if (this.isAdmin()) {
                    return this.vehicleService.getAllVehicles(
                        undefined,
                        withLocalHttpErrorHandling(),
                    );
                }

                const userId = this.authService.currentUser()?.id;
                return userId == null
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
        );

        this.currentListFilters = this.filterState.filters;
        this.vehicles = this.filterState.vehicleOptions;

        if (this.isAdmin()) {
            this.userOptions.load();
        }

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

    protected loadData(): void {
        this.loading.set(true);
        this.loadFailed.set(false);

        this.interventionService.getInterventionHistory(
            this.currentPage(),
            this.pageSize(),
            this.currentFilters(),
            this.currentListFilters(),
            this.isAdmin(),
            withLocalHttpErrorHandling(),
        ).subscribe({
            next: (data) => {
                this.updatePaginationState(data);
                this.loading.set(false);
            },
            error: () => {
                this.loadFailed.set(true);
                this.loading.set(false);
            }
        });
    }

    goBackDashboard(): void {
        if (this.isAdmin()) {
            this.router.navigate(['admin/dashboard']);
        } else {
            this.router.navigate(['user/dashboard']);
        }

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

    onUserSearch(query: string) {
        this.userOptions.search(query);
    }

    onUserPageChange(page: number) {
        this.userOptions.goToPage(page);
    }

}
