import { Component, input, output } from '@angular/core';
import { ListFilterCriteria } from '../../../models/list-filters.model';

@Component({
  selector: 'app-list-filters',
  imports: [],
  templateUrl: './list-filters.html',
  styleUrl: './list-filters.css',
})
export class ListFilters {
  filters = input<ListFilterCriteria>({});
  filtersChange = output<ListFilterCriteria>();
}
