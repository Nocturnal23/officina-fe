import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { JobResponse } from '../../../models/job.model';
import { DateFilter, ListFilterCriteria, UserFilter } from '../../../models/list-filters.model';
import { VehicleResponse } from '../../../models/vehicle.model';
import { UserResponse } from '../../../models/user.model';
import { Paginator } from '../paginator/paginator';
import { ClickOutsideDirective } from '../../directive/click-outside.directive';

interface OptionGroup<T> {
    label: string;
    items: T[];
}

function groupAndSort<T>(
    options: T[],
    getLabel: (item: T) => string,
    compareItems: (a: T, b: T) => number,
): OptionGroup<T>[] {
    const groups = new Map<string, T[]>();

    for (const item of options) {
        const label = getLabel(item);
        const group = groups.get(label) ?? [];

        group.push(item);
        groups.set(label, group);
    }

    return Array.from(groups.entries())
        .sort(([a], [b]) => a.localeCompare(b, 'it'))
        .map(([label, items]) => ({
            label,
            items: items.sort(compareItems),
        }));
}

type FilterMenu = 'user' | 'vehicle';

@Component({
    selector: 'app-list-filters',
    imports: [ReactiveFormsModule, Paginator, ClickOutsideDirective],
    templateUrl: './list-filters.html',
    styleUrl: './list-filters.css',
})
export class ListFilters {
    private readonly fb = inject(FormBuilder);

    filters = input<ListFilterCriteria>({});
    vehicleOptions = input<VehicleResponse[] | null>(null);
    vehicleLoading = input(false);
    vehicleError = input(false);
    vehicleSearchLoading = input(false);
    vehicleSearchError = input(false);
    jobOptions = input<JobResponse[] | null>(null);
    jobError = input(false);
    showUserFilter = input<boolean>(false);
    userOption = input<UserResponse[] | null>(null);
    userLoading = input(false);
    userError = input(false);
    userPage = input(0);
    userTotalPages = input(0);

    filtersChange = output<ListFilterCriteria>();
    vehicleRetry = output<void>();
    vehicleSearchRetry = output<void>();
    jobRetry = output<void>();
    userRetry = output<void>();
    vehicleSearch = output<string>();
    userSearch = output<string>();
    userPageChange = output<number>();

    readonly vehicleSearchTerm = signal('');
    readonly userSearchTerm = signal('');
    readonly selectedJobIds = signal<number[]>([]);
    dateRangeError = signal(false);
    activeMenu = signal<FilterMenu | null>(null);
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


    readonly vehicleGroups = computed(() =>
        groupAndSort(
            (this.vehicleOptions() ?? []).filter(vehicle => {
                const terms = this.vehicleSearchTerm()
                    .trim()
                    .toLocaleLowerCase()
                    .split(/\s+/)
                    .filter(Boolean);

                const searchable =
                    `${vehicle.brand} ${vehicle.model} ${vehicle.plate}`
                        .toLocaleLowerCase();

                return terms.every(term => searchable.includes(term));
            }),
            vehicle => `${vehicle.brand} ${vehicle.model}`,
            (a, b) => a.plate.localeCompare(b.plate, 'it'),
        ),
    );

    readonly userGroups = computed(() =>
        groupAndSort(
            this.userOption() ?? [],
            user => `${user.firstName} ${user.lastName}`,
            (a, b) => a.email.localeCompare(b.email, 'it'),
        ),
    );


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
        this.closeMenu();

        this.dateRangeError.set(false);

        this.filtersChange.emit({});

    }

    selectUser(user: UserResponse | null): void {
        this.form.controls.userId.setValue(user?.id ?? null);

        this.selectedUser.set(user ? {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        } : null);

        this.closeMenu();
    }

    selectVehicle(vehicle: VehicleResponse | null): void {
        this.form.controls.vehicleId.setValue(vehicle?.id ?? null);
        this.closeMenu();
    }

    toggleMenu(menu: FilterMenu): void {
        this.activeMenu.update(current =>
            current === menu ? null : menu
        );
    }

    closeMenu(menu?: FilterMenu): void {
        if (menu === undefined || this.activeMenu() === menu) {
            this.activeMenu.set(null);
        }
    }

}
