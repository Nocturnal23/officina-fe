import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DateFilter, ListFilterCriteria } from '../../../models/list-filters.model';

@Component({
  selector: 'app-list-filters',
  imports: [ReactiveFormsModule],
  templateUrl: './list-filters.html',
  styleUrl: './list-filters.css',
})
export class ListFilters {
  private readonly fb = inject(FormBuilder);

  filters = input<ListFilterCriteria>({});
  filtersChange = output<ListFilterCriteria>();
  dateRangeError = signal(false);

  readonly form = this.fb.nonNullable.group({
    mode: ['range' as DateFilter['mode']],
    date: [''],
    from: [''],
    to: [''],
  });

  constructor() {
    effect(() => {
      const date = this.filters().date;
      this.dateRangeError.set(false);

      if (!date) {
        this.form.patchValue({ mode: 'range', date: '', from: '', to: '' }, { emitEvent: false });
      } else if (date.mode === 'range') {
        this.form.patchValue(
          { mode: date.mode, date: '', from: date.from, to: date.to },
          { emitEvent: false },
        );
      } else {
        this.form.patchValue(
          { mode: date.mode, date: date.date, from: '', to: '' },
          { emitEvent: false },
        );
      }
    });
  }

  applyFilters(): void {
    const { mode, date, from, to } = this.form.getRawValue();

    if (mode === 'range') {
      this.dateRangeError.set(Boolean(from && to && from > to));
      if (!from || !to || this.dateRangeError()) return;
    } else if (!date) {
      return;
    }

    const dateFilter: DateFilter = mode === 'range' ? { mode, from, to } : { mode, date };

    this.filtersChange.emit({ ...this.filters(), date: dateFilter });
  }

  clearFilters(): void {
    this.form.reset({ mode: 'range', date: '', from: '', to: '' });
    this.dateRangeError.set(false);
    this.filtersChange.emit({});
  }
}
