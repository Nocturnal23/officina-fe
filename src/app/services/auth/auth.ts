import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, UserRequest, UserResponse } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private authUrl = 'http://localhost:8080/api/auth';
  private userUrl = 'http://localhost:8080/api/users';

  currentUser = signal<UserResponse | null>(this.getUserFromStorage())

  register(userData: UserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.authUrl}/register`, userData);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, credentials).pipe(
      tap((response) => {
        this.currentUser.set(response.user);

        localStorage.setItem(
          'currentUser',
           JSON.stringify(response.user)
          );

          localStorage.setItem('token', response.token);
      })
    );
  }

  updateUser(changes: Partial<UserRequest>): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.userUrl}/me`, changes).pipe(
      tap((user: UserResponse) => {
        this.currentUser.set(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      })
    );
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private getUserFromStorage(): UserResponse | null {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }
}
