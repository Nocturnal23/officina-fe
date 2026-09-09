import { Component, inject, input, output, signal } from '@angular/core';
import { Auth } from '../../services/auth/auth';
import { Vehicle } from '../../services/vehicles/vehicle';
import { VehicleResponse } from '../../models/vehicle.model';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Booking } from '../../services/booking/booking';

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

  selectedVehicleId = input<number | null>(null);
  close = output<void>();

  vehicles = signal<VehicleResponse[]>([]);

  bookingForm = this.fb.nonNullable.group({
    appointmentDate: ['', Validators.required],
    vehicleId: this.fb.control<number | null>(null, Validators.required),
    jobsIds: this.fb.control<number[]>([], Validators.required),
    notes: [''],
  });

  ngOnInit(): void {
    this.loadVehicles();
    this.bookingForm.patchValue({
      vehicleId: this.selectedVehicleId()
    });
  }

  closeCard(): void {
    this.close.emit();
  }

  loadVehicles(): void {
    const user = this.authService.currentUser();
    if (user?.id) {
      this.vehicleService.getVehiclesByUser(user.id).subscribe({
        next: (data) => this.vehicles.set(data),
        error: (err) => console.error('Errore recupero veicoli:', err)
      });
    }
  }

  submitBooking(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const { vehicleId, ...request } = this.bookingForm.getRawValue();

    this.bookingService.createBooking(vehicleId??0, request).subscribe({
      next: () => {
        this.closeCard();
      },
      error: (err) => {
        console.log("Errore durante la prenotazione: ", err);
      }
    })
  }
}
