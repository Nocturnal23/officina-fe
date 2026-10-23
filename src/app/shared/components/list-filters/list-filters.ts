import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { JobResponse } from '../../../models/job.model';
import { DateFilter, ListFilterCriteria, UserFilter } from '../../../models/list-filters.model';
import { VehicleResponse } from '../../../models/vehicle.model';
import { UserResponse } from '../../../models/user.model';
import { Paginator } from '../paginator/paginator';

interface VehicleOptionGroup {
  label: string;
  vehicles: VehicleResponse[];
}

interface UserOptionGroup {
  label: string;
  users: UserResponse[];
}

@Component({
  selector: 'app-list-filters',
  imports: [ReactiveFormsModule, Paginator],
  templateUrl: './list-filters.html',
  styleUrl: './list-filters.css',
})
export class ListFilters {
  private readonly fb = inject(FormBuilder);

  filters = input<ListFilterCriteria>({});
  vehicleOptions = input<VehicleResponse[] | null>(null);
  jobOptions = input<JobResponse[] | null>(null);
  showUserFilter = input<boolean>(false);
  userOption = input<UserResponse[] | null>(null);
  userPage = input(0);
  userTotalPages = input(0);

  filtersChange = output<ListFilterCriteria>();
  vehicleSearch = output<string>();
  userSearch = output<string>();
  userPageChange = output<number>();

  private readonly vehicleSearchTerm = signal('');
  readonly userSearchTerm = signal('');
  readonly selectedJobIds = signal<number[]>([]);
  dateRangeError = signal(false);
  userMenuOpen = signal(false);
  readonly selectedUser = signal<UserFilter | null>(null);
  readonly selectedUserLabel = computed(
    () => this.selectedUser()?.email ?? 'Tutti gli utenti',
  );


  readonly sortedJobs = computed(() =>
    [...(this.jobOptions() ?? [])].sort((left, right) => left.type.localeCompare(right.type, 'it')),
  );
  readonly userIsLastPage = computed(
    () => this.userPage() >= this.userTotalPages() - 1,
  );

  readonly form = this.fb.nonNullable.group({
    mode: ['range' as DateFilter['mode']],
    date: [''],
    from: [''],
    to: [''],
    vehicleId: [null as number | null],
    userId: [null as number | null]
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

  readonly userGroups = computed(() => {
    const groups = new Map<string, UserOptionGroup>();

    for (const user of this.userOption() ?? []) {
      const groupLabel = `${user.firstName} ${user.lastName}`;
      let group = groups.get(groupLabel);

      if (!group) {
        group = { label: groupLabel, users: [] };
        groups.set(groupLabel, group);
      }

      group.users.push(user);
    }

    return Array.from(groups.values())
      .sort((left, right) => left.label.localeCompare(right.label, 'it'))
      .map((group) => ({
        ...group,
        users: group.users.sort((left, right) => left.email.localeCompare(right.email, 'it')),
      }));
  });

  constructor() {
    effect(() => {
      const filters = this.filters();
      const date = filters.date;
      this.dateRangeError.set(false);
      this.selectedJobIds.set(filters.jobIds ?? []);
      this.selectedUser.set(filters.user ?? null);

      if (!date) {
        this.form.patchValue(
          { mode: 'range', date: '', from: '', to: '', vehicleId: filters.vehicle?.id ?? null, userId: filters.user?.id ?? null },
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
            userId: filters.user?.id ?? null
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
            userId: filters.user?.id ?? null
          },
          { emitEvent: false },
        );
      }
    });
  }

  applyFilters(): void {
    const { mode, date, from, to, vehicleId, userId } = this.form.getRawValue();
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

    const updatedFilters: ListFilterCriteria = { ...this.filters() };
    delete updatedFilters.date;
    delete updatedFilters.vehicle;
    delete updatedFilters.jobIds;
    delete updatedFilters.user;

    if (dateFilter) updatedFilters.date = dateFilter;

    const selectedJobIds = this.selectedJobIds();
    if (selectedJobIds.length > 0) updatedFilters.jobIds = selectedJobIds;

    const selectedVehicle = this.vehicleOptions()?.find((vehicle) => vehicle.id === vehicleId);
    if (selectedVehicle) {
      updatedFilters.vehicle = {
        id: selectedVehicle.id,
        brand: selectedVehicle.brand,
        model: selectedVehicle.model,
        plate: selectedVehicle.plate,
      };
    }

    if (userId != null) {
      const user = this.selectedUser();

      if (user?.id === userId) {
        updatedFilters.user = user;
      }
    }

    this.filtersChange.emit(updatedFilters);
  }

  onVehicleSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.vehicleSearchTerm.set(query);
    this.vehicleSearch.emit(query);
  }

  onJobSelectionChange(jobId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedJobIds.update((selectedIds) =>
      checked
        ? [...selectedIds, jobId]
        : selectedIds.filter((selectedId) => selectedId !== jobId),
    );
  }

  onUserSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.userSearchTerm.set(query);
    this.userSearch.emit(query);
  }

  clearFilters(): void {
    this.form.reset({ mode: 'range', date: '', from: '', to: '', vehicleId: null, userId: null });
    this.vehicleSearchTerm.set('');
    this.vehicleSearch.emit('');

    this.selectedJobIds.set([]);
    this.userSearchTerm.set('');
    this.userSearch.emit('');
    this.selectedUser.set(null);
    this.userMenuOpen.set(false);

    this.dateRangeError.set(false);
    
    this.filtersChange.emit({});
    
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update(open => !open);
  }

  selectUser(user: UserResponse | null): void {
    this.form.controls.userId.setValue(user?.id ?? null);

    this.selectedUser.set( user? {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    }: null);

    this.userMenuOpen.set(false);
  }
}
