import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { BookingResponse, BookingStatus } from '../../../../models/booking.model';
import { JobResponse } from '../../../../models/job.model';
import { UserResponse } from '../../../../models/user.model';
import { VehicleResponse } from '../../../../models/vehicle.model';
import { VehicleService } from '../../../vehicles/services/vehicle.service';
import { UserService } from '../../../user/services/user.service';
import { InterventionService } from '../../services/intervention.service';
import { JobService } from '../../../jobs/services/job.service';

@Component({
  selector: 'app-intervention-card',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './intervention-card.html',
  styleUrl: './intervention-card.css',
})
export class InterventionCard {
  close = output<void>();
  confirm = output<void>();

  booking = input.required<BookingResponse>();
  targetStatus = input<BookingStatus | null>();
  customer = input<UserResponse | null>();
  vehicle = input<VehicleResponse | null>();

  private readonly userService = inject(UserService);
  private readonly vehicleService = inject(VehicleService);
  private readonly jobsService = inject(JobService);
  private readonly interventionService = inject(InterventionService);
  private readonly fb = inject(FormBuilder);

  usersList = signal<UserResponse[]>([]);
  vehiclesList = signal<VehicleResponse[]>([]);
  jobsList = signal<JobResponse[]>([]);

  isServicesModalOpen = signal(false);
  selectedServiceIds = signal<number[]>([]);

  interventionForm = this.fb.group({
    userId: [null as number | null, Validators.required],
    vehicleId: [null as number | null, Validators.required],
    jobsIds: [[] as number[], [Validators.required, Validators.minLength(1)]],
    kilometers: [null as number | null, [Validators.required, Validators.min(0)]],
    cost: [null as number | null, [Validators.required, Validators.min(0)]],
    notes: [''],
  });

  private userSearchControl = new FormControl('');

  ngOnInit(): void {
    this.loadJobs();
    const currentBooking = this.booking();
    const status = this.targetStatus();

    if(currentBooking) {
      if (this.customer()) this.usersList.set([this.customer()!]);
      if (this.vehicle()) this.vehiclesList.set([this.vehicle()!]);

      this.interventionForm.patchValue({
        userId: currentBooking.userId,
        vehicleId: currentBooking.vehicleId,
        jobsIds: currentBooking.jobsIds || []
      });

      if (status === 'REFUSED') {
        this.interventionForm.patchValue({
          cost: 0
        });

        this.interventionForm.controls.cost.disable();
      }

      this.interventionForm.controls.userId.disable();
      this.interventionForm.controls.vehicleId.disable();
      this.selectedServiceIds.set(currentBooking.jobsIds || []);
      
      this.updateNotesValidation();

      if (currentBooking.vehicleId) {
        this.loadLastKilometers(currentBooking.vehicleId);
      }
    } else {
      this.loadUsers();

      this.userSearchControl.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => {
          const searchQuery = query ? query : undefined;
          return this.userService.getAllUsers(0, 10, searchQuery);
        })
      ).subscribe({
        next: (response) => this.usersList.set(response.content),
        error: (err) => console.error("Errore ricerca", err)
      });

      this.interventionForm.controls.userId.valueChanges.subscribe(selectedUserId => {
        if (selectedUserId) {
          this.loadVehiclesByUser(selectedUserId);
          this.interventionForm.controls.vehicleId.reset(); 
        } else {
          this.vehiclesList.set([]);
        }
      });

      this.interventionForm.controls.vehicleId.valueChanges.subscribe(selectedVehicleId => {
        if (selectedVehicleId) {
          this.loadLastKilometers(selectedVehicleId);
        } else {
          this.interventionForm.controls.kilometers.setValidators([Validators.required, Validators.min(0)]);
          this.interventionForm.controls.kilometers.updateValueAndValidity();
        }
      });
    }
  }


  private loadJobs(): void {
    this.jobsService.getJobs().subscribe({
      next: (data) => this.jobsList.set(data),
      error: (err) => console.log("Errore durante il recupero dei serivizi ", err)
    })
  }

  selectedServices = computed(() => {
    const ids = this.selectedServiceIds();
    const allJobs = this.jobsList();
    return allJobs.filter(job => ids.includes(job.id));
  });

  isRefused() {
    if(this.targetStatus() === "REFUSED")
      return true;
    return false;
  }
  
  toggleService(id: number): void {
    const ids = this.selectedServiceIds();

    const originalJobs = this.booking()?.jobsIds || [];

    if (ids.includes(id)) {
      if (originalJobs.includes(id)) {
        return; 
      }

      const newIds = ids.filter(serviceId => serviceId !== id);
      this.selectedServiceIds.set(newIds);
      this.interventionForm.patchValue({ jobsIds: newIds });
      
    } else {
      const newIds = [...ids, id];
      this.selectedServiceIds.set(newIds);
      this.interventionForm.patchValue({ jobsIds: newIds });
      this.updateNotesValidation();
    }

    this.interventionForm.get('jobsIds')?.markAsDirty();
  }

  removeService(id: number): void {
    this.toggleService(id);
    this.updateNotesValidation();
  }

  toggleServicesModal(): void {
    this.isServicesModalOpen.update(p => !p);
  }

  isSelected(id: number): boolean {
    return this.selectedServiceIds().includes(id);
  }

  private loadUsers(): void {
    this.userService.getAllUsers(0, 10).subscribe({
      next: (res) => this.usersList.set(res.content),
      error: (err) => console.log("Errore durante il recupero dei clienti ", err)
    });
  }

  private loadVehiclesByUser(userId: number) {
    this.vehicleService.getVehiclesByUser(userId).subscribe({
      next: (vehicles) => this.vehiclesList.set(vehicles),
      error: (err) => console.error("Errore caricamento veicoli", err)
    });
  }

  private loadLastKilometers(vehicleId: number): void {
    this.interventionService.getLastVehicleKilometers(vehicleId).subscribe({
      next: (lastKm) => {
        const kmControl = this.interventionForm.controls.kilometers;
        
        if (this.isRefused()) {
          kmControl.setValue(lastKm);
          kmControl.disable();
        } else {
          kmControl.setValidators([Validators.required, Validators.min(lastKm)]);
          kmControl.updateValueAndValidity();
        }
      },
      error: (err) => console.error("Errore durante il recupero dei chilometri: ", err)
    });
  }

  closeCard() {
    this.close.emit();
  }

  submitIntervention() {
    if (this.interventionForm.invalid) {
      this.interventionForm.markAllAsTouched();
      return;
    }

    const formValue = this.interventionForm.getRawValue();

    if(formValue.userId === null || formValue.vehicleId === null || formValue.jobsIds === null) {
      return;
    }

    const { vehicleId, userId, ...request } = formValue;

    const finalObj = {
      bookingId: this.booking().id,
      status: this.targetStatus() || this.booking().status,
      ...request
    }

    console.log(finalObj);

    this.interventionService.createIntervention(vehicleId, finalObj).subscribe({
      next: () => {
        this.confirm.emit();
      },
      error: (err) => {
        console.log("Errore durante la registrazione della prestazione.");
      }
    })
  }

  isOriginalJob(id: number): boolean {
    return this.booking()?.jobsIds?.includes(id) ?? false;
  }

  get notesErrorMessage(): string | null {
    const control = this.interventionForm.controls.notes;
    
    if (control.valid || !control.touched) {
      return null;
    }

    if (control.hasError('required')) {
      if (this.isRefused()) {
        return "Se rifiuti l'incarico devi specificare il motivo.";
      }
      return "La descrizione è obbligatoria se selezioni un servizio generico.";
    }

    if (control.hasError('maxlength')) {
      return `La descrizione deve essere al massimo di ${control.getError('maxlength').requiredLength} caratteri.`;
    }

    return null;
  }

  private updateNotesValidation(): void {
    const hasAltro = this.selectedServices().some(s => s.type.toUpperCase() === 'ALTRO');

    const activeValidators = [Validators.maxLength(500)];

    if (this.isRefused() || hasAltro) {
      activeValidators.push(Validators.required);
    }

    this.interventionForm.controls.notes.setValidators(activeValidators);
    this.interventionForm.controls.notes.updateValueAndValidity();
  }
}
