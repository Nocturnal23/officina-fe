import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BookingStatus } from '../../../models/booking.model';
import { InterventionCompletionRequest, InterventionHistoryRequest, InterventionHistoryResponse } from '../../../models/intervention.models';
import { PageResponse } from '../../../models/pagination.model';


@Injectable({
  providedIn: 'root',
})
export class InterventionService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/users/me'
  private adminUrl = 'http://localhost:8080/api/admin'

  createIntervention(vehicleId: number, request: InterventionCompletionRequest): Observable<InterventionHistoryResponse> {
    return this.http.post<InterventionHistoryResponse>(`${this.adminUrl}/vehicles/${vehicleId}/interventions`, request);
  }

  deleteIntervention(interventionId: number): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/intervention/${interventionId}`);
  }

  updateIntervention(interventionId: number, request: InterventionHistoryRequest): Observable<InterventionHistoryResponse>{
    return this.http.post<InterventionHistoryResponse>(`${this.adminUrl}/interventions/${interventionId}`, request);
  }

  getInterventionHistory(page: number, size: number, statuses?: BookingStatus[]): Observable<PageResponse<InterventionHistoryResponse>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (statuses && statuses.length > 0) {
      params = params.set('statuses', statuses.join(','));
    }

    return this.http.get<PageResponse<InterventionHistoryResponse>>(`${this.url}/history/interventions`, { params });
  }
}
