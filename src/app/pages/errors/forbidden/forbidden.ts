import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-forbidden',
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './forbidden.html',
  styleUrl: './forbidden.css',
})
export class Forbidden {
    private readonly router = inject(Router);

    goBackDashboard(){
        this.router.navigate(['/user/dashboard']);
    }
}
