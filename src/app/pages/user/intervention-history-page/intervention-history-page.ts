import { Component, DestroyRef, inject, signal } from '@angular/core';
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
  );

  currentFilters = signal<BookingStatus[]>([BookingStatus.COMPLETED, BookingStatus.REFUSED]);
  currentListFilters = this.filterState.filters;
  vehicles = this.filterState.vehicleOptions;
  jobs = signal<JobResponse[] | null>(null);
  
  BookingStatuBut = BookingStatus;

  ngOnInit() {
    this.jobService.getHistoryJobs().subscribe({
      next: (jobs) => this.jobs.set(jobs),
      error: (err) => console.error('Errore durante il recupero dei lavori per lo storico:', err),
    });
    this.loadData();
  }

  protected loadData(): void {
    this.interventionService.getInterventionHistory(
      this.currentPage(), 
      this.pageSize(),
      this.currentFilters(),
      this.currentListFilters()
    ).subscribe({
        next: (response) => this.updatePaginationState(response),
        error: (err) => console.error('Errore nel recupero dello storico interventi:', err)
      });
  }

  goBackDashboard(): void {
    this.router.navigate(['user/dashboard']);
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
