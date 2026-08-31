import { Routes } from '@angular/router';
import { AuthenticationPage } from './pages/authentication-page/authentication-page';
import { AdminDashboardPage } from './pages/admin-dashboard-page/admin-dashboard-page';
import { UserDashboardPage } from './pages/user-dashboard-page/user-dashboard-page';

export const routes: Routes = [
    { path: 'login', component: AuthenticationPage },
    { path: 'register', component: AuthenticationPage },
    { path: 'admin/dashboard', component: AdminDashboardPage },
    { path: 'user/dashboard', component: UserDashboardPage },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    
];
