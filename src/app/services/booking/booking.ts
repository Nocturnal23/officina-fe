import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BookingRequest, BookingResponse } from '../../models/booking.model';
import { Observable, retry } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class Booking {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/users/me'

  createBooking(vehicleId: number, request: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.url}/vehicles/${vehicleId}/bookings`, request);
  }

  deleteBooking(bookingId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/bookings/${bookingId}`)
  }

  getBooking(): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${this.url}/bookings`);
  }
}
