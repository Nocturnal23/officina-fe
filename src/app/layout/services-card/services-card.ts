import { Component, inject, output } from '@angular/core';
import { Job } from '../../services/job/job';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-services-card',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './services-card.html',
  styleUrl: './services-card.css',
})
export class ServicesCard {
  private readonly fb = inject(FormBuilder);
  private readonly jobsService = inject(Job);

  close = output<void>();

  serviceForm = this.fb.nonNullable.group({
    type: ['', [Validators.required]],
    description: ['', [Validators.required]]
  })

  closeCard() {
    this.close.emit()
  }

  addService(): void {

  }
}
