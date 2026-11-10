import { Injectable } from "@angular/core";
import { interval, Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class PollingService {
    poll(intervalMs = 15000): Observable<number> {
        return interval(intervalMs);
    }
}