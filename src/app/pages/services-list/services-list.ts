import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { JobResponse } from '../../models/job.model';
import { Job } from '../../services/job/job';
import { ServicesCard } from "../../layout/services-card/services-card";

@Component({
  selector: 'app-services-list',
  imports: [CommonModule, ServicesCard],
  templateUrl: './services-list.html',
  styleUrl: './services-list.css',
})
export class ServicesList {
  private readonly router = inject(Router);
  private readonly jobsService = inject(Job);

  jobs = signal<JobResponse[]>([]);
  showServiceCard = signal<boolean>(false);

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
