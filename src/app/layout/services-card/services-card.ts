import { Component, inject, output } from '@angular/core';
import { Job } from '../../services/job/job';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { JobRequest, JobResponse } from '../../models/job.model';

@Component({
  selector: 'app-services-card',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './services-card.html',
  styleUrl: './services-card.css',
})
export class ServicesCard {
  private readonly fb = inject(FormBuilder);
  private readonly jobsService = inject(Job);

  close = output<void>();
  created = output<JobResponse>();

  serviceForm = this.fb.nonNullable.group({
    type: ['', [Validators.required]],
    description: ['', [Validators.required]]
  })

  closeCard() {
    this.close.emit()
  }

  addService(): void {
    if (this.serviceForm.invalid) return;

    const request: JobRequest = this.serviceForm.getRawValue();

    this.jobsService.createJobs(request).subscribe({
      next: (job) => {
        this.created.emit(job);
        this.close.emit();
      },
      error: (err) => console.error("Errore durante la creazione del servizio: ", err)
    })
  }
}
