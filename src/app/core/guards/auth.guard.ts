import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth/auth.service";

export const authGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.hasValidSession()) {
        return true;
    }

    auth.logout();
    return router.createUrlTree(['/login']);
};