import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginRequest, UserRequest, UserResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/users';

  currentUser = signal<UserResponse | null>(this.getUserFromStorage())

  register(userData: UserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.url}/register`, userData);
  }

  login(credentials: LoginRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.url}/login`, credentials).pipe(
      tap((user: UserResponse) => {
        this.currentUser.set(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      })
    );
  }

  updateUser(userId: number, changes: Partial<UserRequest>): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.url}/${userId}`, changes).pipe(
      tap((user: UserResponse) => {
        this.currentUser.set(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      })
    );
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
  }

  private getUserFromStorage(): UserResponse | null {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }
}
