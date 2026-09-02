import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { Auth } from "../auth/auth";

export const authGuard: CanActivateFn = () => {
    const auth = inject(Auth);
    const token = auth.getToken();
    const router = inject(Router);

    if(token) {
        return true;
    }

    return router.createUrlTree(['/login']);
};