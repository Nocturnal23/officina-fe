import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface JobItem {
  id: number;
  name: string;
  description: string;
  available: boolean;
}

@Component({
  selector: 'app-services-list',
  imports: [CommonModule],
  templateUrl: './services-list.html',
  styleUrl: './services-list.css',
})
export class ServicesList {
  private readonly router = inject(Router);

  goBackDashboard(): void {
    this.router.navigate(['admin/dashboard']);
  }
}
