import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { JobResponse, JobRequest, JobAvailabilityRequest } from '../../../models/job.model';

@Injectable({
  providedIn: 'root',
})
export class JobService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api';

  getJobs(): Observable<JobResponse[]> {
    return this.http.get<JobResponse[]>(`${this.url}/jobs`);
  } 

  createJobs(request: JobRequest): Observable<JobResponse> {
    return this.http.post<JobResponse>(`${this.url}/admin/jobs`, request);
  }

  deleteJob(jobId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/admin/jobs/${jobId}`)
  }

  updateJob(jobId: number, changes: Partial<JobRequest>): Observable<JobResponse> {
    return this.http.patch<JobResponse>(`${this.url}/admin/jobs/${jobId}`, changes);
  }

  updateAvailability(jobId: number, request: JobAvailabilityRequest): Observable<JobResponse> {
    return this.http.patch<JobResponse>(
      `${this.url}/admin/jobs/${jobId}/availability`,
      request
    );
  }

  getAdminJobs(): Observable<JobResponse[]> {
    return this.http.get<JobResponse[]>(`${this.url}/admin/jobs`);
  }

  getJobsById(jobId: number): Observable<JobResponse> {
    return this.http.get<JobResponse>(`${this.url}/jobs/${jobId}`)
  }

  getHistoryJobs(): Observable<JobResponse[]> {
    return this.http.get<JobResponse[]>(`${this.url}/jobs/history-options`)
  }

}
