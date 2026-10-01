import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Paginator } from '../../layout/paginator/paginator';
import { Intervention } from '../../services/intervention/intervention';
import { BasePaginatorComponent } from '../../abstract/BasePaginatorComponent';
import { InterventionHistoryResponse } from '../../models/intervention.models';

@Component({
  selector: 'app-intervention-history-page',
  imports: [Paginator],
  templateUrl: './intervention-history-page.html',
  styleUrl: './intervention-history-page.css',
})
export class InterventionHistoryPage extends BasePaginatorComponent<InterventionHistoryResponse> {
  private readonly router = inject(Router);
  private readonly interventionService = inject(Intervention);

  ngOnInit() {
    this.loadData();
  }

  protected loadData(): void {
    this.interventionService.getInterventionHistory(
      this.currentPage(), 
      this.pageSize(),
    ).subscribe({
        next: (response) => this.updatePaginationState(response),
        error: (err) => console.error('Errore nel recupero dello storico interventi:', err)
      });
  }

  goBackDashboard(): void {
    this.router.navigate(['user/dashboard']);
  }
}
