import { Component, computed, inject, input, output, signal } from '@angular/core';
import { BookingResponse, BookingStatus, StatusChangeEvent } from '../../models/booking.model';
import { CommonModule, DatePipe } from '@angular/common';
import { Vehicle } from '../../services/vehicles/vehicle';
import { VehicleResponse } from '../../models/vehicle.model';
import { Job } from '../../services/job/job';
import { JobResponse } from '../../models/job.model';
import { UserResponse } from '../../models/user.model';
import { Auth } from '../../services/auth/auth';

@Component({
  selector: 'app-booking-card-view',
  imports: [DatePipe, CommonModule],
  templateUrl: './booking-card-view.html',
  styleUrl: './booking-card-view.css',
})
export class BookingCardView {
  private vehicle = inject(Vehicle);
  private job = inject(Job);
  private authService = inject(Auth);

  booking = input.required<BookingResponse>();
  isAdmin = input<boolean>(false);

  delete = output<number>();
  statusChange = output<StatusChangeEvent>();

  vehicleDetails = signal<VehicleResponse | null>(null);
  jobDetails = signal<string[]>([]);
  customer = signal<UserResponse | null>(null);

  ngOnInit(): void {
    if (this.isAdmin() && this.booking().userId) {
      this.authService.getUserById(this.booking().userId).subscribe({
        next: (userData) => this.customer.set(userData),
        error: (err) => console.error('Errore anagrafica cliente:', err)
      });
    }
    this.retrieveVehicleInfo();
    this.retrieveJobInfo();
  }

  get canBeDeleted(): boolean {
    return this.booking().status === BookingStatus.PENDING;
  }

  onDelete(): void {
    if (confirm('Sei sicuro di voler annullare questa prenotazione?')) {
      this.delete.emit(this.booking().id);
    }
  }

  onAccept(): void {
    this.statusChange.emit({
      id: this.booking().id,
      status: BookingStatus.CONFIRMED
    });
  }

  onStatusChange(): void {
    const current = this.booking().status;
    let nextStatus: BookingStatus | null = null;

    if (current === BookingStatus.CONFIRMED) {
      nextStatus = BookingStatus.IN_PROGRESS;
    } else if (current === BookingStatus.IN_PROGRESS) {
      nextStatus = BookingStatus.COMPLETED;
    }

    if (nextStatus) {
      this.statusChange.emit({
        id: this.booking().id,
        status: nextStatus
      });
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
