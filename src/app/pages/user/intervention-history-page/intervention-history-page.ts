import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Paginator } from '../../../shared/components/paginator/paginator';
import { InterventionHistoryResponse } from '../../../models/intervention.models';
import { BookingStatus } from '../../../models/booking.model';
import { CommonModule } from '@angular/common';
import { BasePaginatorComponent } from '../../../core/base/BasePaginatorComponent';
import { InterventionCardView } from '../../../features/intervention/components/intervention-card-view/intervention-card-view';
import { InterventionService } from '../../../features/intervention/services/intervention.service';

@Component({
  selector: 'app-intervention-history-page',
  imports: [Paginator, CommonModule, InterventionCardView],
  templateUrl: './intervention-history-page.html',
  styleUrl: './intervention-history-page.css',
})
export class InterventionHistoryPage extends BasePaginatorComponent<InterventionHistoryResponse> {
  private readonly router = inject(Router);
  private readonly interventionService = inject(InterventionService);

  currentFilters = signal<BookingStatus[]>([BookingStatus.COMPLETED, BookingStatus.REFUSED]);
  BookingStatuBut = BookingStatus;

  ngOnInit() {
    this.loadData();
  }

  protected loadData(): void {
    this.interventionService.getInterventionHistory(
      this.currentPage(), 
      this.pageSize(),
      this.currentFilters()
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
