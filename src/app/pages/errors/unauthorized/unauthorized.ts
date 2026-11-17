import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-unauthorized',
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './unauthorized.html',
  styleUrl: './unauthorized.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Unauthorized {
    private readonly router = inject(Router);
    
    goToLogin(){
        this.router.navigate(['/login']);
    }
}
