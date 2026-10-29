import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileMenu } from "../../../features/profile/components/profile-menu/profile-menu";
import { BookingResponse, BookingStatus } from '../../../models/booking.model';
import { Paginator } from '../../../shared/components/paginator/paginator';
import { BasePaginatorComponent } from '../../../core/base/BasePaginatorComponent';
import { BookingCardView } from '../../../features/booking/components/booking-card-view/booking-card-view';
import { BookingCard } from '../../../features/booking/components/booking-card/booking-card';
import { AuthService } from '../../../core/services/auth/auth.service';
import { BookingService } from '../../../features/booking/services/booking.service';
import { withHttpErrorMessage, withLocalHttpErrorHandling } from '../../../core/interceptors/http-error.cotext';


@Component({
    selector: 'app-user-dashboard-page',
    imports: [ProfileMenu, BookingCard, BookingCardView, Paginator],
    templateUrl: './user-dashboard-page.html',
    styleUrl: './user-dashboard-page.css',
})
export class UserDashboardPage extends BasePaginatorComponent<BookingResponse> {
    protected readonly authService = inject(AuthService);
    private router = inject(Router);
    private bookingService = inject(BookingService);

    isMenuOpen = signal<boolean>(false);
    isProfileOpen = signal<boolean>(false);
    showBookingCard = signal<boolean>(false);
    loading = signal(true);
    loadFailed = signal(false);

    ngOnInit(): void {
        this.loadData();
    }

    toggleMenu(): void {
        this.isMenuOpen.update(open => !open);
    }

    closeMenu(): void {
        this.isMenuOpen.set(false);
    }

    openProfile(): void {
        this.closeMenu();
        this.isProfileOpen.set(true);
    }

    closeProfile(): void {
        this.isProfileOpen.set(false);
    }

    openBookingCard(): void {
        this.showBookingCard.set(true);
    }

    closeBookingCard(): void {
        this.showBookingCard.set(false);
    }

    onBookingCreated(): void {
        this.closeBookingCard();
        this.currentPage.set(0);
        this.loadData();
    }

    openHistory(): void {
        this.closeMenu();
        this.router.navigate(['user/history'])
    }

    openInterventionHistory(): void {
        this.closeMenu();
        this.router.navigate(['user/interventionhistory'])
    }

    logout(): void {
        this.closeMenu();
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    protected loadData(): void {
        this.loading.set(true);
        this.loadFailed.set(false);

        this.bookingService.getBookings(
            this.currentPage(),
            this.pageSize(),
            [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS],
            withLocalHttpErrorHandling(),
        ).subscribe({
            next: (data) => {
                this.updatePaginationState(data);
                this.loading.set(false);
            },
            error: () => {
                this.loadFailed.set(true);
                this.loading.set(false);
            }
        });
    }

    deleteBooking(bookingId: number): void {
        this.bookingService.deleteBooking(
            bookingId,
            withHttpErrorMessage('Non è stato possibile eliminare la prenotazione.'),
        ).subscribe({
            next: () => {
                this.dataList.update(list => list.filter(b => b.id !== bookingId));
            },
            error: () => { },
        });
    }
}
