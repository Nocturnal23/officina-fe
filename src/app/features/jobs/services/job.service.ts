import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { JobResponse, JobRequest, JobAvailabilityRequest } from '../../../models/job.model';

@Injectable({
    providedIn: 'root',
})
export class JobService {
    private http = inject(HttpClient);
    private url = 'http://localhost:8080/api';

    getJobs(context?: HttpContext): Observable<JobResponse[]> {
        return this.http.get<JobResponse[]>(
            `${this.url}/jobs`,
            { context }
        );
    }

    createJobs(request: JobRequest, context?: HttpContext): Observable<JobResponse> {
        return this.http.post<JobResponse>(`${this.url}/admin/jobs`, request, { context });
    }

    deleteJob(jobId: number, context?: HttpContext): Observable<void> {
        return this.http.delete<void>(`${this.url}/admin/jobs/${jobId}`, { context })
    }

    updateJob(jobId: number, changes: Partial<JobRequest>, context?: HttpContext): Observable<JobResponse> {
        return this.http.patch<JobResponse>(`${this.url}/admin/jobs/${jobId}`, changes, { context });
    }

    updateAvailability(jobId: number, request: JobAvailabilityRequest, context?: HttpContext): Observable<JobResponse> {
        return this.http.patch<JobResponse>(
            `${this.url}/admin/jobs/${jobId}/availability`,
            request,
            { context }
        );
    }

    getAdminJobs(context?: HttpContext): Observable<JobResponse[]> {
        return this.http.get<JobResponse[]>(`${this.url}/admin/jobs`, { context });
    }

    getJobsById(jobId: number, context?: HttpContext): Observable<JobResponse> {
        return this.http.get<JobResponse>(`${this.url}/jobs/${jobId}`, { context });
    }

    getHistoryJobs(context?: HttpContext): Observable<JobResponse[]> {
        return this.http.get<JobResponse[]>(`${this.url}/jobs/history-options`, { context })
    }

}
