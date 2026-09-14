import { Component, inject, input, output, signal } from '@angular/core';
import { BookingResponse } from '../../models/booking.model';
import { DatePipe } from '@angular/common';
import { Vehicle } from '../../services/vehicles/vehicle';
import { VehicleResponse } from '../../models/vehicle.model';
import { Job } from '../../services/job/job';
import { JobResponse } from '../../models/job.model';

@Component({
  selector: 'app-booking-card-view',
  imports: [DatePipe],
  templateUrl: './booking-card-view.html',
  styleUrl: './booking-card-view.css',
})
export class BookingCardView {
  private vehicle = inject(Vehicle);
  private job = inject(Job);

  booking = input.required<BookingResponse>();
  parent = output<number>();

  vehicleDetails = signal<VehicleResponse| null>(null);
  jobDetails = signal<string[]>([]);

  ngOnInit(): void {
    this.retrieveVehicleInfo();
    this.retrieveJobInfo();
  }

  get canBeDeleted(): boolean {
    return this.booking().status === 'PENDING';
  }

  onDelete(): void {
    if (confirm('Sei sicuro di voler annullare questa prenotazione?')) {
      this.parent.emit(this.booking().id);
    }
  }

  retrieveVehicleInfo(): void {
      const id = this.booking().vehicleId;
      if (id) {
        this.vehicle.getVehicleById(id).subscribe({
          next: (res) => this.vehicleDetails.set(res),
          error: (err) => console.error('Errore recupero veicolo:', err)
        });
      }
    }

  retrieveJobInfo(): void {
    const id = this.booking().jobsIds;
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
