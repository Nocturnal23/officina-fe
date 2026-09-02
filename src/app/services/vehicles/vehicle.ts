import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VehicleRequest, VehicleResponse } from '../../models/vehicle.model';

@Injectable({
  providedIn: 'root',
})

export class Vehicle {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/users/me/vehicles';

  getVehiclesByUser(userId: number): Observable<VehicleResponse[]> {
    return this.http.get<VehicleResponse[]>(this.url);
  }

  deleteVehicle(userId: number, vehicleId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${vehicleId}`);
  }

  createVehicle(userId: number, vehicleData: VehicleRequest): Observable<VehicleResponse> {
    return this.http.post<VehicleResponse>(this.url, vehicleData);
  }
}
