import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
    selector: 'app-paginator',
    imports: [CommonModule],
    templateUrl: './paginator.html',
    styleUrl: './paginator.css',
})
export class Paginator {
    currentPage = input.required<number>();
    totalPages = input.required<number>();
    isLastPage = input.required<boolean>();
    compact = input(false);

    next = output<void>();
    prev = output<void>();

    onNext() {
        if (!this.isLastPage()) {
            this.next.emit();
        }
    }

    onPrev() {
        if (this.currentPage() > 0) {
            this.prev.emit();
        }
    }
}
