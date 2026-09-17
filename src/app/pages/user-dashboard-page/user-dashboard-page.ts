import { Component, inject, signal } from '@angular/core';
import { Auth } from '../../services/auth/auth';
import { Router } from '@angular/router';
import { ProfileMenu } from "../../layout/profile-menu/profile-menu";
import { Booking } from '../../services/booking/booking';
import { BookingResponse, BookingStatus } from '../../models/booking.model';
import { BookingCard } from "../../layout/booking-card/booking-card";
import { BookingCardView } from '../../layout/booking-card-view/booking-card-view';

@Component({
    selector: 'app-user-dashboard-page',
    imports: [ProfileMenu, BookingCard, BookingCardView],
    templateUrl: './user-dashboard-page.html',
    styleUrl: './user-dashboard-page.css',
})
export class UserDashboardPage {
    protected readonly authService = inject(Auth);
    private router = inject(Router);
    private bookingService = inject(Booking);


    isMenuOpen = signal<boolean>(false);
    isProfileOpen = signal<boolean>(false);
    bookings = signal<BookingResponse[]>([]);
    showBookingCard = signal<boolean>(false);

    currentPage = signal<number>(0);
    pageSize = signal<number>(3);
    isLastPage = signal<boolean>(true);
    totalPages = signal<number>(0);


    ngOnInit(): void {
        this.loadBookings();
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
        this.loadBookings();
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

    private loadBookings() {
        this.bookingService.getBookings(
            this.currentPage(),
            this.pageSize(),
            [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]
        ).subscribe({
            next: (data) => {
                this.bookings.set(data.content);
                this.isLastPage.set(data.last);
                this.totalPages.set(data.totalPages);
            },
            error: (err) => {
                console.log("Nessuna prenotazione: ", err);
            }
        })
    }

    deleteBooking(bookingId: number): void {
        this.bookingService.deleteBooking(bookingId).subscribe({
            next: () => {
                this.bookings.update(list => list.filter(b => b.id !== bookingId));
            },
            error: (err) => {
                console.error('Errore durante l\'eliminazione della prenotazione', err);
            }
        });
    }

    nextPage() {
        if (!this.isLastPage()) {
            this.currentPage.update(p => p + 1);
            this.loadBookings();
        }
    }

    prevPage() {
        if (this.currentPage() > 0) {
            this.currentPage.update(p => p - 1);
            this.loadBookings();
        }
    }
}
