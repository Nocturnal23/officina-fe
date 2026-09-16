import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-history-page',
  imports: [],
  templateUrl: './history-page.html',
  styleUrl: './history-page.css',
})
export class HistoryPage {
  private readonly router = inject(Router);
  
  goBackDashboard(): void {
    this.router.navigate(['user/dashboard']);
  }
}
