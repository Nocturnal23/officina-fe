import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { UserResponse, UserRequest } from '../../../models/user.model';
import { LoginRequest, LoginResponse } from '../../../models/auth.model';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private http = inject(HttpClient);
    private authUrl = 'http://localhost:8080/api/auth';

    currentUser = signal<UserResponse | null>(this.getUserFromStorage())

    register(userData: UserRequest, context?: HttpContext): Observable<UserResponse> {
        return this.http.post<UserResponse>(`${this.authUrl}/register`, userData, { context });
    }

    login(credentials: LoginRequest, context?: HttpContext): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.authUrl}/login`, credentials, { context }).pipe(
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

    updateCurrentUserState(user: UserResponse): void {
        this.currentUser.set(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
    }
}
