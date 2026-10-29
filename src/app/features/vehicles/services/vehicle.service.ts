import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VehicleResponse, VehicleRequest } from '../../../models/vehicle.model';

@Injectable({
    providedIn: 'root',
})

export class VehicleService {
    private http = inject(HttpClient);
    private url = 'http://localhost:8080/api/users/me/vehicles';
    private urlAdmin = 'http://localhost:8080/api/admin/vehicles';

    getVehiclesByUser(userId: number, context?: HttpContext): Observable<VehicleResponse[]> {
        return this.http.get<VehicleResponse[]>(this.url, { context });
    }

    getAllVehicles(plate?: string, context?: HttpContext): Observable<VehicleResponse[]> {
        let params = new HttpParams();

        if (plate?.trim()) {
            params = params.set('plate', plate.trim());
        }

        return this.http.get<VehicleResponse[]>(this.urlAdmin, { params, context });
    }

    deleteVehicle(userId: number, vehicleId: number, context?: HttpContext): Observable<void> {
        return this.http.delete<void>(`${this.url}/${vehicleId}`, { context });
    }

    createVehicle(userId: number, vehicleData: VehicleRequest, context?: HttpContext): Observable<VehicleResponse> {
        return this.http.post<VehicleResponse>(this.url, vehicleData, { context });
    }

    getVehicleById(vehicleId: number, context?: HttpContext): Observable<VehicleResponse> {
        return this.http.get<VehicleResponse>(`${this.url}/${vehicleId}`, { context });
    }
}
