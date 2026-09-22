import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-paginator',
  imports: [CommonModule],
  templateUrl: './paginator.html',
  styleUrl: './paginator.css',
})
export class Paginator {
  @Input({ required: true }) currentPage!: number;
  @Input({ required: true }) totalPages!: number;
  @Input({ required: true }) isLastPage!: boolean;

  @Output() next = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();

  onNext() {
    if (!this.isLastPage) {
      this.next.emit();
    }
  }

  onPrev() {
    if (this.currentPage > 0) {
      this.prev.emit();
    }
  }
}
