import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { JobResponse } from '../../../models/job.model';
import { ServicesCard } from "../../../features/jobs/components/services-card/services-card";
import { JobService } from '../../../features/jobs/services/job/job.service';

@Component({
  selector: 'app-services-list',
  imports: [CommonModule, ServicesCard],
  templateUrl: './services-list.html',
  styleUrl: './services-list.css',
})
export class ServicesList {
  private readonly router = inject(Router);
  private readonly jobsService = inject(JobService);

  jobs = signal<JobResponse[]>([]);
  showServiceCard = signal<boolean>(false);

  readonly sortedJobs = computed(() => {
    return [...this.jobs()].sort((a, b) => {
      if (a.deleted !== b.deleted) {
        return a.deleted ? 1 : -1;
      }
      return a.type.localeCompare(b.type, 'it', { sensitivity: 'base' });
    });
  });

  ngOnInit(): void{
    this.loadJobs();
  }

  private loadJobs(): void {
    this.jobsService.getAdminJobs().subscribe({
      next: (data) => this.jobs.set(data),
      error: (err) => console.log("Errore durante il recupero dei serivizi ", err)
    })
  }

  openServiceCard() {
    this.showServiceCard.set(true);
  }

  closeServiceCard() {
    this.showServiceCard.set(false);
  }

  addJobToList(job: JobResponse): void {
    this.jobs.update(jobs => [...jobs, job]);
  }

  goBackDashboard(): void {
    this.router.navigate(['admin/dashboard']);
  }

  suspendJob(job: JobResponse): void {
    this.changeAvailability(job, true);
  }

  reactivateJob(job: JobResponse): void {
    this.changeAvailability(job, false);
  }

  private changeAvailability(job: JobResponse, deleted: boolean): void {
    this.jobsService.updateAvailability(job.id, { deleted }).subscribe({
      next: (updatedJob) => {
        this.jobs.update(jobs =>
          jobs.map(item =>
            item.id === updatedJob.id ? updatedJob : item
          )
        );
      },
      error: (err) => {
        console.error('Errore aggiornamento disponibilità:', err);
      }
    });
  }
}
