import { TestBed } from '@angular/core/testing';

import { Booking } from './booking.service';

describe('Booking', () => {
  let service: Booking;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
