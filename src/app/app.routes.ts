import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AdminDashboardPage } from './pages/admin/admin-dashboard-page/admin-dashboard-page';
import { ServicesList } from './pages/admin/services-list/services-list';
import { AuthenticationPage } from './pages/auth/authentication-page/authentication-page';
import { HistoryPage } from './pages/user/history-page/history-page';
import { InterventionHistoryPage } from './pages/user/intervention-history-page/intervention-history-page';
import { UserDashboardPage } from './pages/user/user-dashboard-page/user-dashboard-page';
import { guestGuard } from './core/guards/guest.guard';
import { adminGuard } from './core/guards/admin.guard';


export const routes: Routes = [
    { path: 'login', component: AuthenticationPage, canActivate: [guestGuard] },
    { path: 'register', component: AuthenticationPage, canActivate: [guestGuard] },
    { path: 'admin/dashboard', component: AdminDashboardPage, canActivate: [authGuard, adminGuard] },
    { path: 'user/dashboard', component: UserDashboardPage, canActivate: [authGuard] },
    { path: 'user/history', component: HistoryPage, canActivate: [authGuard] },
    { path: 'user/interventionhistory', component: InterventionHistoryPage, canActivate: [authGuard], data: { isAdmin: false } },
    { path: 'admin/services', component: ServicesList, canActivate: [adminGuard] },
    { path: 'admin/record', component: InterventionHistoryPage, canActivate: [adminGuard], data: { isAdmin: true } },
    { path: '', redirectTo: 'login', pathMatch: 'full' },

];
