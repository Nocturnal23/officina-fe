import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { InterventionCard } from '../../../intervention/components/intervention-card/intervention-card';
import { VehicleResponse } from '../../../../models/vehicle.model';
import { UserResponse } from '../../../../models/user.model';
import { AdminBookingAction } from '../../../../pages/admin/admin-dashboard-page/admin-dashboard-page';
import { BOOKING_STATUS_CONFIG, BookingResponse, BookingStatus, StatusChangeEvent } from '../../../../models/booking.model';
import { JobService } from '../../../jobs/services/job/job.service';
import { VehicleService } from '../../../vehicles/services/vehicles/vehicle.service';
import { UserService } from '../../../user/services/user.service';



@Component({
  selector: 'app-booking-card-view',
  imports: [DatePipe, CommonModule, InterventionCard],
  templateUrl: './booking-card-view.html',
  styleUrl: './booking-card-view.css',
})
export class BookingCardView {
  private vehicle = inject(VehicleService);
  private job = inject(JobService);
  private userService = inject(UserService);

  booking = input.required<BookingResponse>();
  isAdmin = input<boolean>(false);

  delete = output<number>();
  statusChange = output<StatusChangeEvent>();

  vehicleDetails = signal<VehicleResponse | null>(null);
  jobDetails = signal<string[]>([]);
  customer = signal<UserResponse | null>(null);
  isInterventionOpen = signal<boolean>(false);
  pendingStatus = signal<BookingStatus | null>(null);

  ngOnInit(): void {
    if (this.isAdmin() && this.booking().userId) {
      this.userService.getUserById(this.booking().userId).subscribe({
        next: (userData) => this.customer.set(userData),
        error: (err) => console.error('Errore anagrafica cliente:', err)
      });
    }
    this.retrieveVehicleInfo();
    this.retrieveJobInfo();
  }

  currentStatusMeta = computed(() =>
    BOOKING_STATUS_CONFIG[this.booking().status] ?? {
      label: this.booking().status,
      badgeClass: 'border-slate-200 bg-slate-50 text-slate-700'
    }
  );

  get canBeDeleted(): boolean {
    return this.booking().status === BookingStatus.PENDING;
  }

  onDelete(): void {
    if (confirm('Sei sicuro di voler annullare questa prenotazione?')) {
      this.delete.emit(this.booking().id);
    }
  }

  onStatusChange(action: AdminBookingAction): void {
    if (action === 'REFUSE') {
      this.pendingStatus.set(BookingStatus.REFUSED);
      this.isInterventionOpen.set(true);
      return;
    }

    const nextStatus = BOOKING_STATUS_CONFIG[this.booking().status]?.next;

    if (nextStatus) {
      if(nextStatus === BookingStatus.COMPLETED){
        this.pendingStatus.set(BookingStatus.COMPLETED);
        this.isInterventionOpen.set(true);
        return;
      }
      this.statusChange.emit({
        id: this.booking().id,
        status: nextStatus
      });
    }
  }

  onInterventionConfirmed(): void {
    const currentBooking = this.booking();
    const targetStatus = this.pendingStatus();
    
    if (targetStatus) {
      this.statusChange.emit({
        id: this.booking().id,
        status: targetStatus
      });
    }
    
    this.closeInterventionCard();
  }

  closeInterventionCard() {
    this.isInterventionOpen.set(false);
    this.pendingStatus.set(null);
  }

  private retrieveVehicleInfo(): void {
    const id = this.booking().vehicleId;
    if (id) {
      this.vehicle.getVehicleById(id).subscribe({
        next: (res) => this.vehicleDetails.set(res),
        error: (err) => console.error('Errore recupero veicolo:', err)
      });
    }
  }

  private retrieveJobInfo(): void {
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
