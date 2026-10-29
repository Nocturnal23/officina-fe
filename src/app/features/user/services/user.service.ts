import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { PageResponse } from '../../../models/pagination.model';
import { UserRequest, UserResponse, ChangePasswordRequest } from '../../../models/user.model';
import { AuthService } from '../../../core/services/auth/auth.service';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);

    private userUrl = 'http://localhost:8080/api/users';
    private adminUrl = 'http://localhost:8080/api/admin';

    updateUser(changes: Partial<UserRequest>, context?: HttpContext): Observable<UserResponse> {
        return this.http.patch<UserResponse>(`${this.userUrl}/me`, changes, { context }).pipe(
            tap((user: UserResponse) => {
                this.authService.updateCurrentUserState(user);
            })
        );
    }

    deleteUser(context?: HttpContext): Observable<void> {
        return this.http.delete<void>(`${this.userUrl}/me`, { context });
    }

    getUserById(userId: number, context?: HttpContext): Observable<UserResponse> {
        return this.http.get<UserResponse>(`${this.adminUrl}/users/${userId}`, { context });
    }

    getAllUsers(page: number, size: number, query?: string, context?: HttpContext): Observable<PageResponse<UserResponse>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (query) {
            params = params.set('query', query);
        }

        return this.http.get<PageResponse<UserResponse>>(`${this.adminUrl}/users`, { params, context });
    }

    changePassword(passwords: ChangePasswordRequest, context?: HttpContext): Observable<void> {
        return this.http.patch<void>(`${this.userUrl}/me/password`, passwords, { context });
    }
}
