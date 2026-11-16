import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth/auth.service";

export const adminGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const user = auth.currentUser();

    if (!auth.hasValidSession() || !user) {
        auth.logout();
        return router.createUrlTree(['/login']);
    }

    if (user.role === 'ADMIN') {
        return true;
    }

    return router.createUrlTree(['/forbidden']);
}