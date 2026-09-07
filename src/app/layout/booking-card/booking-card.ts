import { Component, output } from '@angular/core';

@Component({
  selector: 'app-booking-card',
  imports: [],
  templateUrl: './booking-card.html',
  styleUrl: './booking-card.css',
})
export class BookingCard {
  close = output<void>();

  closeCard(): void {
    this.close.emit();
  }
}
