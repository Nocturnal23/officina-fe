import { Routes } from '@angular/router';
import { AuthenticationPage } from './pages/authentication-page/authentication-page';
import { AdminDashboardPage } from './pages/admin-dashboard-page/admin-dashboard-page';
import { UserDashboardPage } from './pages/user-dashboard-page/user-dashboard-page';
import { authGuard } from './services/guard/authGuard';
import { ServicesList } from './pages/services-list/services-list';

export const routes: Routes = [
    { path: 'login', component: AuthenticationPage },
    { path: 'register', component: AuthenticationPage },
    { path: 'admin/dashboard', component: AdminDashboardPage, canActivate: [authGuard] },
    { path: 'user/dashboard', component: UserDashboardPage, canActivate: [authGuard] },
    { path: 'admin/services', component: ServicesList },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    
];
