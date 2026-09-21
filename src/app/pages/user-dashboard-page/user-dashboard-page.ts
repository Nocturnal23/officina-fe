import { Component, inject, signal } from '@angular/core';
import { Auth } from '../../services/auth/auth';
import { Router } from '@angular/router';
import { ProfileMenu } from "../../layout/profile-menu/profile-menu";
import { Booking } from '../../services/booking/booking';
import { BookingResponse, BookingStatus } from '../../models/booking.model';
import { BookingCard } from "../../layout/booking-card/booking-card";
import { BookingCardView } from '../../layout/booking-card-view/booking-card-view';
import { Paginator } from '../../layout/paginator/paginator';
import { BasePaginatorComponent } from '../../abstract/BasePaginatorComponent';

@Component({
    selector: 'app-user-dashboard-page',
    imports: [ProfileMenu, BookingCard, BookingCardView, Paginator],
    templateUrl: './user-dashboard-page.html',
    styleUrl: './user-dashboard-page.css',
})
export class UserDashboardPage extends BasePaginatorComponent<BookingResponse> {
    protected readonly authService = inject(Auth);
    private router = inject(Router);
    private bookingService = inject(Booking);

    isMenuOpen = signal<boolean>(false);
    isProfileOpen = signal<boolean>(false);
    showBookingCard = signal<boolean>(false);

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

    logout(): void {
        this.closeMenu();
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    protected loadData(): void {
        this.bookingService.getBookings(
            this.currentPage(),
            this.pageSize(),
            [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]
        ).subscribe({
            next: (data) => {
                this.updatePaginationState(data); 
            },
            error: (err) => {
                console.log("Nessuna prenotazione: ", err);
            }
        });
    }

    deleteBooking(bookingId: number): void {
        this.bookingService.deleteBooking(bookingId).subscribe({
            next: () => {
                this.dataList.update(list => list.filter(b => b.id !== bookingId));
            },
            error: (err) => {
                console.error('Errore durante l\'eliminazione della prenotazione', err);
            }
        });
    }
}
