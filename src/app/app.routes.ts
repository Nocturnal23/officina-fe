import { Routes } from '@angular/router';
import { authGuard } from './core/guards/authGuard';
import { AdminDashboardPage } from './pages/admin/admin-dashboard-page/admin-dashboard-page';
import { ServicesList } from './pages/admin/services-list/services-list';
import { AuthenticationPage } from './pages/auth/authentication-page/authentication-page';
import { HistoryPage } from './pages/user/history-page/history-page';
import { InterventionHistoryPage } from './pages/user/intervention-history-page/intervention-history-page';
import { UserDashboardPage } from './pages/user/user-dashboard-page/user-dashboard-page';


export const routes: Routes = [
    { path: 'login', component: AuthenticationPage },
    { path: 'register', component: AuthenticationPage },
    { path: 'admin/dashboard', component: AdminDashboardPage, canActivate: [authGuard] },
    { path: 'user/dashboard', component: UserDashboardPage, canActivate: [authGuard] },
    { path: 'user/history', component: HistoryPage, canActivate: [authGuard] },
    { path: 'user/interventionhistory', component: InterventionHistoryPage, canActivate: [authGuard] },
    { path: 'admin/services', component: ServicesList },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    
];
