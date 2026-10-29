import { Component, computed, inject, input, OnDestroy, output, signal } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { JobResponse } from '../../../../models/job.model';
import { VehicleResponse } from '../../../../models/vehicle.model';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { VehicleService } from '../../../vehicles/services/vehicle.service';
import { BookingService } from '../../services/booking.service';
import { JobService } from '../../../jobs/services/job.service';
import { bookingDateValidator, formatLocalDate } from '../../../../shared/validators/booking-date.validator';
import { withHttpErrorMessage, withLocalHttpErrorHandling } from '../../../../core/interceptors/http-error.cotext';

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
export class BookingCard implements OnDestroy {
    private readonly authService = inject(AuthService);
    private readonly vehicleService = inject(VehicleService);
    private readonly bookingService = inject(BookingService);
    private readonly fb = inject(FormBuilder);
    private readonly jobsService = inject(JobService);

    selectedVehicleId = input<number | null>(null);
    close = output<void>();
    created = output<void>();

    vehicles = signal<VehicleResponse[]>([]);
    vehiclesLoading = signal(false);
    vehiclesLoadFailed = signal(false);
    services = signal<JobResponse[]>([]);
    servicesLoading = signal(false);
    servicesLoadFailed = signal(false);
    isServicesModalOpen = signal(false);
    selectedServiceIds = signal<number[]>([]);

    idServizioAltro: number | null = null;
    minDate: string = '';
    dateErrorMessage = signal<string | null>(null);
    private errorTimeout: ReturnType<typeof setTimeout> | null = null;

    ngOnInit(): void {
        this.minDate = formatLocalDate(new Date());

        this.bookingForm.controls['appointmentDate'].valueChanges.subscribe(() => {
            this.handleDateErrors();
        });

        this.loadVehicles();
        this.loadJobs();
        this.bookingForm.patchValue({
            vehicleId: this.selectedVehicleId(),
        });

        this.bookingForm.controls.jobsIds.valueChanges.subscribe((selectedIds) => {
            const notesControl = this.bookingForm.controls.notes;

            if (this.idServizioAltro !== null && selectedIds?.includes(this.idServizioAltro)) {
                notesControl.setValidators([Validators.required]);
            } else {
                notesControl.clearValidators();
            }
            notesControl.updateValueAndValidity();
        });
    }

    ngOnDestroy(): void {
        if (this.errorTimeout !== null) {
            clearTimeout(this.errorTimeout);
        }
    }

    bookingForm = this.fb.nonNullable.group({
        appointmentDate: ['', [Validators.required, bookingDateValidator]],
        vehicleId: [null as number | null, Validators.required],
        jobsIds: [[] as number[], [Validators.required, Validators.minLength(1)]],
        notes: [''],
    });

    selectedServices = computed(() => {
        const ids = this.selectedServiceIds();
        return this.services().filter((service) => ids.includes(service.id));
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
            const newIds = ids.filter((serviceId) => serviceId !== id);
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
        if (user?.id == null) {
            this.vehiclesLoadFailed.set(true);
            return;
        }

        this.vehiclesLoading.set(true);
        this.vehiclesLoadFailed.set(false);
        this.vehicleService.getVehiclesByUser(user.id, withLocalHttpErrorHandling()).subscribe({
            next: (data) => this.vehicles.set(data),
            error: () => {
                this.vehiclesLoadFailed.set(true);
                this.vehiclesLoading.set(false);
            },
            complete: () => this.vehiclesLoading.set(false),
        });
    }

    retryLoadVehicles(): void {
        this.loadVehicles();
    }

    private loadJobs(): void {
        this.servicesLoading.set(true);
        this.servicesLoadFailed.set(false);
        this.jobsService.getJobs(withLocalHttpErrorHandling()).subscribe({
            next: (data) => {
                this.services.set(data);
                this.servicesLoading.set(false);

                const jobAltro = data.find((job) => job.type.toUpperCase() === 'ALTRO');
                if (jobAltro) {
                    this.idServizioAltro = jobAltro.id;
                }
            },
            error: () => {
                this.servicesLoadFailed.set(true);
                this.servicesLoading.set(false);
            },
        });
    }

    retryLoadJobs(): void {
        this.loadJobs();
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

        this.bookingService.createBooking(
            vehicleId,
            request,
            withHttpErrorMessage('Non è stato possibile creare la prenotazione.'),
        ).subscribe({
            next: () => {
                this.closeCard();
                this.created.emit();
            },
            error: () => { },
        });
    }

    private handleDateErrors(): void {
        const control = this.bookingForm.controls.appointmentDate;
        const errors = control.errors;

        if (this.errorTimeout !== null) {
            clearTimeout(this.errorTimeout);
            this.errorTimeout = null;
        }

        const message = this.getDateErrorMessage(errors);
        if (!message) {
            this.dateErrorMessage.set(null);
            return;
        }

        this.showTemporaryMessage(message);
        control.setValue('', { emitEvent: false });
    }

    private showTemporaryMessage(message: string): void {
        this.dateErrorMessage.set(message);
        this.errorTimeout = setTimeout(() => {
            this.dateErrorMessage.set(null);
            this.errorTimeout = null;
        }, 4000);
    }

    private getDateErrorMessage(errors: ValidationErrors | null): string | null {
        if (errors?.['pastDate']) return 'Non puoi selezionare una data passata.';
        if (errors?.['weekend']) return 'I sabati e le domeniche non sono disponibili per la prenotazione.';
        if (errors?.['summerClosure']) return "L'officina è chiusa dal 16 al 31 Agosto per le ferie estive.";
        if (errors?.['winterClosure']) return "L'officina è chiusa dal 24 al 31 Dicembre per le ferie natalizie."
        if (errors?.['holiday']) return `L'officina è chiusa per ${errors['holiday']}.`;
        if (errors?.['invalidDate']) return 'La data selezionata non è valida.';
        return null;
    }
}
