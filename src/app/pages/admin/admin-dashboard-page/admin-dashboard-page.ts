import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BOOKING_TABS, BookingResponse, BookingStatus, StatusChangeEvent } from '../../../models/booking.model';
import { PageResponse } from '../../../models/pagination.model';
import { CommonModule } from '@angular/common';
import { Paginator } from '../../../shared/components/paginator/paginator';
import { BookingCardView } from '../../../features/booking/components/booking-card-view/booking-card-view';
import { BasePaginatorComponent } from '../../../core/base/BasePaginatorComponent';
import { AuthService } from '../../../core/services/auth/auth.service';
import { BookingService } from '../../../features/booking/services/booking.service';
import { ListFilters } from '../../../shared/components/list-filters/list-filters';
import { ListFilterCriteria } from '../../../models/list-filters.model';
import { VehicleService } from '../../../features/vehicles/services/vehicle.service';
import { JobService } from '../../../features/jobs/services/job.service';
import { JobResponse } from '../../../models/job.model';
import { UserResponse } from '../../../models/user.model';
import { UserService } from '../../../features/user/services/user.service';
import { PagedOptionsState } from '../../../shared/state/paged-options-state';
import { AdminFilterOptionsState } from '../../../shared/state/admin-filter-options-state';
import { withHttpErrorMessage, withLocalHttpErrorHandling } from '../../../core/interceptors/http-error.cotext';
import { InterventionCard } from '../../../features/intervention/components/intervention-card/intervention-card';
import { ClickOutsideDirective } from '../../../shared/directive/click-outside.directive';
import { PollingService } from '../../../core/services/polling/polling.services';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, exhaustMap, forkJoin } from 'rxjs';


export type AdminBookingAction = 'ACCEPT' | 'REFUSE' | 'ADVANCE';

@Component({
    selector: 'app-admin-dashboard-page',
    imports: [CommonModule, BookingCardView, Paginator, ListFilters, InterventionCard, ClickOutsideDirective],
    templateUrl: './admin-dashboard-page.html',
    styleUrl: './admin-dashboard-page.css',
})
export class AdminDashboardPage extends BasePaginatorComponent<BookingResponse> {
    protected readonly authService = inject(AuthService);
    private router = inject(Router);
    private bookingService = inject(BookingService);
    private vehicleService = inject(VehicleService);
    private jobService = inject(JobService);
    private userService = inject(UserService);
    private pollingService = inject(PollingService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly userFilterVehicleId = signal<number | null>(null);

    readonly tabs = BOOKING_TABS;
    readonly userOptions = new PagedOptionsState<UserResponse>(
        this.destroyRef,
        (page, size, query) => {
            const vehicleId = this.userFilterVehicleId();
            return vehicleId === null
                ? this.userService.getAllUsers(
                    page,
                    size,
                    query || undefined,
                    withLocalHttpErrorHandling(),
                )
                : this.userService.getUsersWithBookingsForVehicle(
                    vehicleId,
                    page,
                    size,
                    query || undefined,
                    withLocalHttpErrorHandling(),
                );
        },
    );
    readonly filterOptions = new AdminFilterOptionsState(
        this.destroyRef,
        () => this.vehicleService.getAllVehicles(undefined, withLocalHttpErrorHandling()),
        (userId) => this.vehicleService.getVehiclesBookedByUser(userId, withLocalHttpErrorHandling()),
    );

    isManagerOpen = signal<boolean>(false)
    activeTab = signal<BookingStatus>(BookingStatus.PENDING);
    statusCounts = signal<Record<string, number>>({})
    currentListFilters = signal<ListFilterCriteria>({});
    jobs = signal<JobResponse[] | null>(null);
    jobError = signal(false);
    loading = signal(true);
    loadFailed = signal(false);
    openIntervention = signal(false);

    getCountByStatus(status: BookingStatus): number {
        return this.dataList().filter(b => b.status === status).length;
    }

    ngOnInit(): void {
        this.loadJobs();
        this.userOptions.load();
        this.loadData();
        this.loadBookingStatusCounts();

        this.pollingService.poll().pipe(
            exhaustMap(() => this.fetchDashboardSnapshot()),
            takeUntilDestroyed(this.destroyRef),
        ).subscribe({
            next: snapshot => this.applyDashboardSnapshot(snapshot),
        });
    }

    protected override loadData(): void {
        this.loading.set(true);
        this.loadFailed.set(false);

        this.fetchBookingsPage().subscribe({
            next: page => {
                this.updatePaginationState(page);
                this.loading.set(false);
            },
            error: () => {
                this.loadFailed.set(true);
                this.loading.set(false);
            },
        });
    }

    private fetchBookingsPage() {
        return this.bookingService.getAllBookings(
            this.currentPage(),
            this.pageSize(),
            [this.activeTab()],
            this.currentListFilters(),
            withLocalHttpErrorHandling(),
        );
    }

    private fetchBookingStatusCounts() {
        return this.bookingService.getSumary(
            withLocalHttpErrorHandling(),
        );
    }

    private fetchDashboardSnapshot() {
        return forkJoin({
            bookingsPage: this.fetchBookingsPage(),
            statusCounts: this.fetchBookingStatusCounts(),
        }).pipe(
            catchError(() => EMPTY),
        );
    }

    private loadBookingStatusCounts(): void {
        this.fetchBookingStatusCounts().subscribe({
            next: counts => this.statusCounts.set(counts),
            error: () => { },
        });
    }

    private applyDashboardSnapshot(snapshot: {
        bookingsPage: PageResponse<BookingResponse>;
        statusCounts: Record<BookingStatus, number>;
    }): void {
        this.updatePaginationState(snapshot.bookingsPage);
        this.statusCounts.set(snapshot.statusCounts);
    }

    loadJobs(): void {
        this.jobs.set(null);
        this.jobError.set(false);
        this.jobService.getHistoryJobs(withLocalHttpErrorHandling()).subscribe({
            next: jobs => this.jobs.set(jobs),
            error: () => this.jobError.set(true),
        });
    }

    loadVehicles(): void {
        this.filterOptions.retry();
    }

    selectTab(status: BookingStatus): void {
        this.activeTab.set(status);
        if (status !== BookingStatus.COMPLETED && status !== BookingStatus.REFUSED) {
            this.currentListFilters.set({});
            this.filterOptions.loadForUser(null);
            this.userFilterVehicleId.set(null);
            this.userOptions.reload();
        }
        this.currentPage.set(0);
        this.loadData();
    }

    handleStatusChange(event: StatusChangeEvent): void {
        this.bookingService.updateBookingStatus(
            event.id,
            event.status,
            withHttpErrorMessage('Non è stato possibile aggiornare lo stato della prenotazione.'),
        ).subscribe({
            next: (updatedBooking) => {
                this.dataList.update(items =>
                    items.map(b => (b.id === updatedBooking.id ? updatedBooking : b))
                );
                this.loadBookingStatusCounts();
                this.loadData();
            },
            error: () => { },
        });
    }

    refreshBookings(): void {
        this.loadBookingStatusCounts();
        this.loadData();
    }

    deleteBooking(bookingId: number): void {
        this.bookingService.refuseBooking(
            bookingId,
            withHttpErrorMessage('Non è stato possibile rifiutare la prenotazione.'),
        ).subscribe({
            next: () => {
                this.dataList.update(items => items.filter(b => b.id !== bookingId));
                this.loadBookingStatusCounts();
            },
            error: () => { },
        });
    }

    onListFiltersChange(filters: ListFilterCriteria): void {
        this.currentListFilters.set(filters);

        this.currentPage.set(0);

        this.loadData();
    }

    onUserSelectionChange(userId: number | null): void {
        this.filterOptions.loadForUser(userId);
    }

    onVehicleSelectionChange(vehicleId: number | null): void {
        this.userFilterVehicleId.set(vehicleId);
        this.userOptions.reload();
    }

    onUserSearch(query: string): void {
        this.userOptions.search(query);
    }

    onUserPageChange(page: number): void {
        this.userOptions.goToPage(page);
    }

    toggleManager(): void {
        this.isManagerOpen.update(open => !open);
    }

    closeManager(): void {
        this.isManagerOpen.set(false);
    }

    goToServices(): void {
        this.closeManager();
        this.router.navigate(['admin/services']);
    }

    logout(): void {
        this.closeManager();
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    openInterventionHistory(): void {
        this.closeManager();
        this.router.navigate(['admin/record']);
    }

    emitIntervention(): void {
        this.closeManager();
        this.openIntervention.set(true);
    }

    closeIntervention(): void {
        this.openIntervention.set(false);
    }
}