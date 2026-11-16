import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth/auth.service";
import { inject } from "@angular/core";

export const guestGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const user = auth.currentUser();

    if (!auth.hasValidSession() || !user) {
        auth.logout();
        return true;
    }

    return router.createUrlTree([
        user.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard'
    ]);
}