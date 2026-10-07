import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth/auth.service";

export const authGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const token = auth.getToken();
    const router = inject(Router);

    if(token) {
        return true;
    }

    return router.createUrlTree(['/login']);
};