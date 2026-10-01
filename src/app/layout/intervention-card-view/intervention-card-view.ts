import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { InterventionHistoryResponse } from '../../models/intervention.models';
import { BOOKING_STATUS_CONFIG } from '../../models/booking.model';
import { VehicleResponse } from '../../models/vehicle.model';
import { Vehicle } from '../../services/vehicles/vehicle';
import { Job } from '../../services/job/job';

@Component({
  selector: 'app-intervention-card-view',
  imports: [DatePipe],
  templateUrl: './intervention-card-view.html',
  styleUrl: './intervention-card-view.css',
})
export class InterventionCardView {
  private vehicle = inject(Vehicle);
  private job = inject(Job);

  intervention = input.required<InterventionHistoryResponse>();

  vehicleDetails = signal<VehicleResponse | null>(null);
  jobDetails = signal<string[]>([]);

  currentStatusMeta = computed(() =>
    BOOKING_STATUS_CONFIG[this.intervention().status] ?? {
      label: this.intervention().status,
      badgeClass: 'border-slate-200 bg-slate-50 text-slate-700'
    }
  );

  ngOnInit(): void{
    console.log(this.intervention());
    this.retrieveVehicleInfo();
    this.retrieveJobInfo();
  }

  private retrieveVehicleInfo(): void {
    const id = this.intervention().vehicleId;
    if (id) {
      this.vehicle.getVehicleById(id).subscribe({
        next: (res) => this.vehicleDetails.set(res),
        error: (err) => console.error('Errore recupero veicolo:', err)
      });
    }
  }

  private retrieveJobInfo(): void {
    const id = this.intervention().jobsIds;
    for (var val of id) {
      this.job.getJobsById(val).subscribe({
        next: (job) => {
          this.jobDetails.update((jobs) => [...jobs, job.type]);
        },
        error: (err) => console.error('Errore recupero veicolo:', err)
      });
    }
  }
}
