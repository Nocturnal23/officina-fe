import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BookingRequest, BookingResponse, BookingStatus } from '../../../models/booking.model';
import { PageResponse } from '../../../models/pagination.model';
import { ListFilterCriteria } from '../../../models/list-filters.model';
import { VehicleResponse } from '../../../models/vehicle.model';


@Injectable({
  providedIn: 'root',
})

export class BookingService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/users/me'
  private adminUrl = 'http://localhost:8080/api/admin'

  createBooking(vehicleId: number, request: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.url}/vehicles/${vehicleId}/bookings`, request);
  }

  deleteBooking(bookingId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/bookings/${bookingId}`)
  }

  getBookings(page: number, size: number, statuses?: BookingStatus[]): Observable<PageResponse<BookingResponse>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (statuses && statuses.length > 0) {
      params = params.set('statuses', statuses.join(','));
    }

    return this.http.get<PageResponse<BookingResponse>>(`${this.url}/bookings`, { params });
  }

  getAllBookings(
    page: number,
    size: number,
    statuses?: BookingStatus[],
    filters?: ListFilterCriteria
  ): Observable<PageResponse<BookingResponse>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (statuses && statuses.length > 0) {
      params = params.set('statuses', statuses.join(','));
    }

    if (filters?.date) {
      params = params.set('dateMode', filters.date.mode);

      if (filters.date.mode === 'range') {
        params = params.set('dateFrom', filters.date.from).set('dateTo', filters.date.to);
      } else {
        params = params.set('date', filters.date.date);
      }
    }

    if (filters?.vehicle) {
      params = params.set('vehicleId', filters.vehicle.id);
    }

    if (filters?.jobIds?.length) {
      params = params.set('jobIds', filters.jobIds.join(','));
    }

    if (filters?.user) {
      params = params.set('userId', filters.user.id);
    }

    return this.http.get<PageResponse<BookingResponse>>(`${this.adminUrl}/bookings`, { params });
  }

  updateBookingStatus(bookingId: number, status: BookingStatus): Observable<BookingResponse> {
    return this.http.patch<BookingResponse>(`${this.adminUrl}/bookings/${bookingId}/status`, null, { params: { status } }
    );
  }

  refuseBooking(bookingId: number): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/bookings/${bookingId}`)
  }

  getHistory(
    page: number,
    size: number,
    statuses?: BookingStatus[],
    filters?: ListFilterCriteria
  ): Observable<PageResponse<BookingResponse>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (statuses && statuses.length > 0) {
      params = params.set('statuses', statuses.join(','));
    }

    if (filters?.date) {
      params = params.set('dateMode', filters.date.mode);

      if (filters.date.mode === 'range') {
        params = params.set('dateFrom', filters.date.from).set('dateTo', filters.date.to);
      } else {
        params = params.set('date', filters.date.date);
      }
    }

    if (filters?.vehicle) {
      params = params.set('vehicleId', filters.vehicle.id);
    }

    if (filters?.jobIds?.length) {
      params = params.set('jobIds', filters.jobIds.join(','));
    }

    return this.http.get<PageResponse<BookingResponse>>(`${this.url}/history`, { params });
  }

  getSumary(): Observable<Record<BookingStatus, number>> {
    return this.http.get<Record<BookingStatus, number>>(`${this.adminUrl}/bookings/summary`);
  }

  searchVehiclesInHistory(query: string): Observable<VehicleResponse[]> {
    const params = new HttpParams().set('query', query.trim());

    return this.http.get<VehicleResponse[]>(`${this.url}/history/vehicle`, { params });
  }
}
