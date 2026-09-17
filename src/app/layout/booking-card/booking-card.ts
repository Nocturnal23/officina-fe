import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Auth } from '../../services/auth/auth';
import { Vehicle } from '../../services/vehicles/vehicle';
import { VehicleResponse } from '../../models/vehicle.model';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Booking } from '../../services/booking/booking';
import { JobResponse } from '../../models/job.model';
import { Job } from '../../services/job/job';

interface ServiceItem {
  id: number;
  type: string;
  description: string;
}

@Component({
  selector: 'app-booking-card',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './booking-card.html',
  styleUrl: './booking-card.css',
})

export class BookingCard {
  private readonly authService = inject(Auth);
  private readonly vehicleService = inject(Vehicle);
  private readonly bookingService = inject(Booking);
  private readonly fb = inject(FormBuilder);
  private readonly jobsService = inject(Job);

  selectedVehicleId = input<number | null>(null);
  close = output<void>();
  created = output<void>();

  vehicles = signal<VehicleResponse[]>([]);
  services = signal<JobResponse[]>([]);
  isServicesModalOpen = signal(false);
  selectedServiceIds = signal<number[]>([]);

  ngOnInit(): void {
    this.loadVehicles();
    this.loadJobs();
    this.bookingForm.patchValue({
      vehicleId: this.selectedVehicleId()
    });
  }

  bookingForm = this.fb.nonNullable.group({
    appointmentDate: ['', Validators.required],
    vehicleId: [null as number | null, Validators.required],
    jobsIds: [[] as number[], [Validators.required, Validators.minLength(1)]],
    notes: [''],
  });

  selectedServices = computed(() => {
    const ids = this.selectedServiceIds();
    return this.services().filter(service => ids.includes(service.id));
  });

  openServicesModal(): void {
    this.isServicesModalOpen.set(true);
  }

  closeServicesModal(): void {
    this.isServicesModalOpen.set(false);
  }

  isSelected(id: number): boolean {
    return this.selectedServiceIds().includes(id);
  }

  toggleService(id: number): void {
    const ids = this.selectedServiceIds();

    if (ids.includes(id)) {
      const newIds = ids.filter(serviceId => serviceId !== id);
      this.selectedServiceIds.set(newIds);
      this.bookingForm.patchValue({ jobsIds: newIds });
    } else {
      const newIds = [...ids, id];
      this.selectedServiceIds.set(newIds);
      this.bookingForm.patchValue({ jobsIds: newIds });
    }

    this.bookingForm.get('jobsIds')?.markAsDirty();
  }

  removeService(id: number): void {
    this.toggleService(id);
  }

  closeCard(): void {
    this.close.emit();
  }

  private loadVehicles(): void {
    const user = this.authService.currentUser();
    if (user?.id) {
      this.vehicleService.getVehiclesByUser(user.id).subscribe({
        next: (data) => this.vehicles.set(data),
        error: (err) => console.error('Errore recupero veicoli:', err)
      });
    }
  }

  private loadJobs(): void {
    this.jobsService.getJobs().subscribe({
      next: (data) => this.services.set(data),
      error: (err) => console.log("Errore durante il recupero dei serivizi ", err)
    })
  }

  submitBooking(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const formValue = this.bookingForm.getRawValue();

    if (formValue.vehicleId === null || formValue.jobsIds === null) {
      return;
    }

    const { vehicleId, ...request } = formValue;

    this.bookingService.createBooking(vehicleId, request).subscribe({
      next: () => {
        this.closeCard();
        this.created.emit()
      },
      error: (err) => {
        console.log("Errore durante la prenotazione: ", err);
      }
    })
  }
}
