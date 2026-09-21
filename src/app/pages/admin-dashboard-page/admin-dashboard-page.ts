import { Component, computed, inject, signal } from '@angular/core';
import { Auth } from '../../services/auth/auth';
import { Router } from '@angular/router';
import { Booking } from '../../services/booking/booking';
import { BOOKING_TABS, BookingResponse, BookingStatus, StatusChangeEvent } from '../../models/booking.model';
import { CommonModule } from '@angular/common';
import { BookingCardView } from '../../layout/booking-card-view/booking-card-view';
import { Paginator } from '../../layout/paginator/paginator';
import { BasePaginatorComponent } from '../../abstract/BasePaginatorComponent';

export type AdminBookingAction = 'ACCEPT' | 'REFUSE' | 'ADVANCE';

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [CommonModule, BookingCardView, Paginator],
  templateUrl: './admin-dashboard-page.html',
  styleUrl: './admin-dashboard-page.css',
})
export class AdminDashboardPage extends BasePaginatorComponent<BookingResponse> {
  protected readonly authService = inject(Auth);
  private router = inject(Router);
  private bookingService = inject(Booking);

  readonly tabs = BOOKING_TABS;

  isManagerOpen = signal<boolean>(false)
  activeTab = signal<BookingStatus>(BookingStatus.PENDING);
  statusCounts = signal<Record<string, number>>({})
  
  selectTab(status: BookingStatus): void {
    this.activeTab.set(status);
    this.currentPage.set(0);
    this.loadData();
  }

  getCountByStatus(status: BookingStatus): number {
    return this.dataList().filter(b => b.status === status).length;
  }

  ngOnInit(): void {
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
      [this.activeTab()]
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
      next:(data) => {
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
}