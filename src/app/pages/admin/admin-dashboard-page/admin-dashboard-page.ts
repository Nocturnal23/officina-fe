import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BOOKING_TABS, BookingResponse, BookingStatus, StatusChangeEvent } from '../../../models/booking.model';
import { CommonModule } from '@angular/common';
import { Paginator } from '../../../shared/components/paginator/paginator';
import { BookingCardView } from '../../../features/booking/components/booking-card-view/booking-card-view';
import { BasePaginatorComponent } from '../../../core/base/BasePaginatorComponent';
import { AuthService } from '../../../core/services/auth/auth.service';
import { BookingService } from '../../../features/booking/services/booking.service';
import { ListFilters } from '../../../shared/components/list-filters/list-filters';
import { ListFilterCriteria } from '../../../models/list-filters.model';
import { VehicleResponse } from '../../../models/vehicle.model';
import { VehicleService } from '../../../features/vehicles/services/vehicle.service';
import { JobService } from '../../../features/jobs/services/job.service';
import { JobResponse } from '../../../models/job.model';
import { UserResponse } from '../../../models/user.model';
import { UserService } from '../../../features/user/services/user.service';
import { PagedOptionsState } from '../../../shared/state/paged-options-state';


export type AdminBookingAction = 'ACCEPT' | 'REFUSE' | 'ADVANCE';

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [CommonModule, BookingCardView, Paginator, ListFilters],
  templateUrl: './admin-dashboard-page.html',
  styleUrl: './admin-dashboard-page.css',
})
export class AdminDashboardPage extends BasePaginatorComponent<BookingResponse> {
  protected readonly authService = inject(AuthService);
  private router = inject(Router);
  private bookingService = inject(BookingService);
  private vehicleService = inject(VehicleService);
  private jobService = inject(JobService);
  private userService = inject(UserService);

  readonly tabs = BOOKING_TABS;
  readonly userOptions = new PagedOptionsState<UserResponse>(
    inject(DestroyRef),
    (page, size, query) =>
      this.userService.getAllUsers(page, size, query || undefined),
    {
      errorMessage: 'Errore durante il recupero degli utenti:',
    }
  );

  isManagerOpen = signal<boolean>(false)
  activeTab = signal<BookingStatus>(BookingStatus.PENDING);
  statusCounts = signal<Record<string, number>>({})
  currentListFilters = signal<ListFilterCriteria>({});
  vehicles = signal<VehicleResponse[]>([]);
  jobs = signal<JobResponse[] | null>(null);
  users = signal<UserResponse[] | null>(null);
  userPage = signal(0);

  selectTab(status: BookingStatus): void {
    this.activeTab.set(status);
    if (status !== BookingStatus.COMPLETED && status !== BookingStatus.REFUSED) {
      this.currentListFilters.set({});
    }
    this.currentPage.set(0);
    this.loadData();
  }

  getCountByStatus(status: BookingStatus): number {
    return this.dataList().filter(b => b.status === status).length;
  }

  ngOnInit(): void {
    this.vehicleService.getAllVehicles().subscribe({
      next: (vehicles) => this.vehicles.set(vehicles),
      error: (err) => console.error('Errore durante il recupero dei veicoli admin:', err),
    });
    this.jobService.getHistoryJobs().subscribe({
      next: (jobs) => this.jobs.set(jobs),
      error: (err) => console.error('Errore durante il recupero dei lavori per lo storico:', err),
    });
    this.userOptions.load();
    this.loadData();
    this.loadCount();
  }

  toggleManager(): void {
    this.isManagerOpen.update(open => !open);
  }

  closeManager(): void {
    this.isManagerOpen.set(false);
  }

  goToServices() {
    this.closeManager();
    this.router.navigate(['admin/services'])
  }

  logout() {
    this.closeManager();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  protected loadData() {
    this.bookingService.getAllBookings(
      this.currentPage(),
      this.pageSize(),
      [this.activeTab()],
      this.currentListFilters()
    ).subscribe({
      next: (data) => {
        this.updatePaginationState(data);
      },
      error: (err) => {
        console.log("Nessuna prenotazione: ", err);
      }
    })
  }

  private loadCount() {
    this.bookingService.getSumary().subscribe({
      next: (data) => {
        this.statusCounts.set(data);
      },
      error: (err) => console.error("Errore cont summary:", err)
    })
  }

  handleStatusChange(event: StatusChangeEvent): void {
    this.bookingService.updateBookingStatus(event.id, event.status).subscribe({
      next: (updatedBooking) => {
        this.dataList.update(items =>
          items.map(b => (b.id === updatedBooking.id ? updatedBooking : b))
        );
        this.loadCount();
        this.loadData();
      },
      error: (err) => console.error("Errore update stato:", err)
    });
  }

  deleteBooking(bookingId: number): void {
    this.bookingService.refuseBooking(bookingId).subscribe({
      next: () => {
        this.dataList.update(items => items.filter(b => b.id !== bookingId));
        this.loadCount();
      },
      error: (err) => console.error("Errore cancellazione:", err)
    });
  }

  onListFiltersChange(filters: ListFilterCriteria): void {
    this.currentListFilters.set(filters);

    this.currentPage.set(0);

    this.loadData();
  }

  onUserSearch(query: string): void {
    this.userOptions.search(query);
  }

  onUserPageChange(page: number): void {
    this.userOptions.goToPage(page);
  }
}