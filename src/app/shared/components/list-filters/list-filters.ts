import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DateFilter, ListFilterCriteria } from '../../../models/list-filters.model';
import { VehicleResponse } from '../../../models/vehicle.model';

interface VehicleOptionGroup {
  label: string;
  vehicles: VehicleResponse[];
}

@Component({
  selector: 'app-list-filters',
  imports: [ReactiveFormsModule],
  templateUrl: './list-filters.html',
  styleUrl: './list-filters.css',
})
export class ListFilters {
  private readonly fb = inject(FormBuilder);

  filters = input<ListFilterCriteria>({});
  vehicleOptions = input<VehicleResponse[] | null>(null);
  filtersChange = output<ListFilterCriteria>();
  vehicleSearch = output<string>();
  dateRangeError = signal(false);
  private readonly vehicleSearchTerm = signal('');

  readonly form = this.fb.nonNullable.group({
    mode: ['range' as DateFilter['mode']],
    date: [''],
    from: [''],
    to: [''],
    vehicleId: [null as number | null],
  });

  readonly vehicleGroups = computed(() => {
    const searchTerms = this.vehicleSearchTerm()
      .trim()
      .toLocaleLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    const groups = new Map<string, VehicleOptionGroup>();

    for (const vehicle of this.vehicleOptions() ?? []) {
      const groupLabel = `${vehicle.brand} ${vehicle.model}`;
      const searchableText = `${groupLabel} ${vehicle.plate}`.toLocaleLowerCase();
      if (!searchTerms.every((term) => searchableText.includes(term))) continue;

      let group = groups.get(groupLabel);
      if (!group) {
        group = { label: groupLabel, vehicles: [] };
        groups.set(groupLabel, group);
      }
      group.vehicles.push(vehicle);
    }

    return Array.from(groups.values())
      .sort((left, right) => left.label.localeCompare(right.label, 'it'))
      .map((group) => ({
        ...group,
        vehicles: group.vehicles.sort((left, right) => left.plate.localeCompare(right.plate, 'it')),
      }));
  });

  constructor() {
    effect(() => {
      const filters = this.filters();
      const date = filters.date;
      this.dateRangeError.set(false);

      if (!date) {
        this.form.patchValue(
          { mode: 'range', date: '', from: '', to: '', vehicleId: filters.vehicle?.id ?? null },
          { emitEvent: false },
        );
      } else if (date.mode === 'range') {
        this.form.patchValue(
          {
            mode: date.mode,
            date: '',
            from: date.from,
            to: date.to,
            vehicleId: filters.vehicle?.id ?? null,
          },
          { emitEvent: false },
        );
      } else {
        this.form.patchValue(
          {
            mode: date.mode,
            date: date.date,
            from: '',
            to: '',
            vehicleId: filters.vehicle?.id ?? null,
          },
          { emitEvent: false },
        );
      }
    });
  }

  applyFilters(): void {
    const { mode, date, from, to, vehicleId } = this.form.getRawValue();
    let dateFilter: DateFilter | undefined;

    if (mode === 'range') {
      if (from || to) {
        this.dateRangeError.set(!from || !to || from > to);
        if (this.dateRangeError()) return;
        dateFilter = { mode, from, to };
      }
    } else if (date) {
      dateFilter = { mode, date };
    }

    const updatedFilters = { ...this.filters() };
    delete updatedFilters.date;
    delete updatedFilters.vehicle;

    if (dateFilter) updatedFilters.date = dateFilter;

    const selectedVehicle = this.vehicleOptions()?.find((vehicle) => vehicle.id === vehicleId);
    if (selectedVehicle) {
      updatedFilters.vehicle = {
        id: selectedVehicle.id,
        brand: selectedVehicle.brand,
        model: selectedVehicle.model,
        plate: selectedVehicle.plate,
      };
    }

    this.filtersChange.emit(updatedFilters);
  }

  onVehicleSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.vehicleSearchTerm.set(query);
    this.vehicleSearch.emit(query);
  }

  clearFilters(): void {
    this.form.reset({ mode: 'range', date: '', from: '', to: '', vehicleId: null });
    this.vehicleSearchTerm.set('');
    this.vehicleSearch.emit('');
    this.dateRangeError.set(false);
    this.filtersChange.emit({});
  }
}
