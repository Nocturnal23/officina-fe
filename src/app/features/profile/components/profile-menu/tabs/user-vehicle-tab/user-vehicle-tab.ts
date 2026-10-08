import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { VehicleRequest, VehicleResponse } from '../../../../../../models/vehicle.model';
import { BookingCard } from '../../../../../booking/components/booking-card/booking-card';
import { AuthService } from '../../../../../../core/services/auth/auth.service';
import { VehicleService } from '../../../../../vehicles/services/vehicle.service';

@Component({
  selector: 'app-user-vehicle-tab',
  imports: [CommonModule, ReactiveFormsModule, BookingCard],
  templateUrl: './user-vehicle-tab.html',
  styleUrl: './user-vehicle-tab.css',
})
export class UserVehicleTab {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly vehicleService = inject(VehicleService);

  vehicles = signal<VehicleResponse[]>([]);
  isAdding = signal<boolean>(false);
  showBookingCard = signal<boolean>(false);
  selectedVehicleId = signal<number | null>(null);

  vehicleForm = this.fb.nonNullable.group({
    brand: ['', [Validators.required]],
    model: ['', [Validators.required]],
    plate: ['', [Validators.required]],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(1900)]]
  });

  ngOnInit(): void {
    this.loadVehicles();
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

  toggleAddForm(): void {
    this.isAdding.update(v => !v);
    this.vehicleForm.reset();
  }

  saveVehicle(): void {
    if (this.vehicleForm.invalid) return;

    const user = this.authService.currentUser();
    if (!user?.id) return;

    // Estrae direttamente l'oggetto formattato VehicleRequest
    const request: VehicleRequest = this.vehicleForm.getRawValue();
    request.plate = request.plate.trim().toUpperCase();

    this.vehicleService.createVehicle(user.id, request).subscribe({
      next: (savedVehicle) => {
        this.vehicles.update(list => [...list, savedVehicle]);
        this.toggleAddForm();
      },
      error: (err) => console.error('Errore salvataggio auto:', err)
    });
  }

  deleteVehicle(vehicle: VehicleResponse): void {
    const confirmed = confirm('Sei sicuro di voler eliminare definitivamente il tuo profilo? Questa azione è irreversibile.');
    if (!confirmed) return;

    const user = this.authService.currentUser();
    if (!user?.id) return;

    this.vehicleService.deleteVehicle(user.id, vehicle.id).subscribe({
      next: () => this.vehicles.update(list => list.filter(item => item.id !== vehicle.id)),
      error: (err) => console.error('Errore eliminazione veicolo:', err)
    });
  }

  openBookingCard(vehicleId: number): void {
    this.selectedVehicleId.set(vehicleId);
    this.showBookingCard.set(true);
  }

  closeBookingCard(): void {
    this.showBookingCard.set(false);
    this.selectedVehicleId.set(null);
  }

}
