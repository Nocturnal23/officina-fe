import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VehicleRequest, VehicleResponse } from '../models/vehicle.model';

@Injectable({
  providedIn: 'root',
})

export class Vehicle {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/users';

  getVehiclesByUser(userId: number): Observable<VehicleResponse[]> {
    return this.http.get<VehicleResponse[]>(`${this.url}/${userId}/vehicles`);
  }

  deleteVehicle(userId: number, vehicleId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${userId}/vehicles/${vehicleId}`);
  }

  createVehicle(userId: number, vehicleData: VehicleRequest): Observable<VehicleResponse> {
    return this.http.post<VehicleResponse>(`${this.url}/${userId}/vehicles`, vehicleData);
  }
}
