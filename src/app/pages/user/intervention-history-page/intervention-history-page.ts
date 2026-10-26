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
      this.userService.getAllUsers(page, size, query || undefined),
    {
      errorMessage: 'Errore durante il recupero degli utenti:',
    },
  );

  currentFilters = signal<BookingStatus[]>([BookingStatus.COMPLETED, BookingStatus.REFUSED]);
  jobs = signal<JobResponse[] | null>(null);
  filterState!: HistoryFilterState;
  currentListFilters!: HistoryFilterState['filters'];
  vehicles!: HistoryFilterState['vehicleOptions'];

  isAdmin = input(false);

  BookingStatuBut = BookingStatus;

  ngOnInit() {
    this.filterState = new HistoryFilterState(
      this.destroyRef,
      () => {
        if (this.isAdmin()) {
          return this.vehicleService.getAllVehicles();
        }

        const userId = this.authService.currentUser()?.id;
        return userId == null
          ? null
          : this.vehicleService.getVehiclesByUser(userId);
      },
      () => {
        this.currentPage.set(0);
        this.loadData();
      },
      'Errore durante il recupero dei veicoli:',
    );

    this.currentListFilters = this.filterState.filters;
    this.vehicles = this.filterState.vehicleOptions;

    if (this.isAdmin()) {
      this.userOptions.load();
    }

    this.jobService.getHistoryJobs().subscribe({
      next: (jobs) => this.jobs.set(jobs),
      error: (err) =>
        console.error('Errore durante il recupero dei lavori per lo storico:', err),
    });

    this.loadData();
  }

  protected loadData(): void {
    this.interventionService.getInterventionHistory(
      this.currentPage(),
      this.pageSize(),
      this.currentFilters(),
      this.currentListFilters(),
      this.isAdmin(),
    ).subscribe({
      next: (response) => this.updatePaginationState(response),
      error: (err) => console.error('Errore nel recupero dello storico interventi:', err)
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
