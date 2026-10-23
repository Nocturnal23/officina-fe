import { DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Observable, Subject, catchError, finalize, switchMap, tap, timer } from 'rxjs';
import { PageResponse } from '../../models/pagination.model';

interface PageRequest {
  page: number;
  query: string;
  debounce: boolean;
}

interface PagedOptionsStateOptions {
  pageSize?: number;
  errorMessage?: string;
  searchDebounceMs?: number;
}

export class PagedOptionsState<T> {
  readonly options = signal<T[] | null>(null);
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly query = signal('');

  private readonly requests = new Subject<PageRequest>();
  private readonly pageSize: number;
  private readonly errorMessage: string;
  private readonly searchDebounceMs: number;

  constructor(
    destroyRef: DestroyRef,
    private readonly fetchPage: (
      page: number,
      size: number,
      query: string,
    ) => Observable<PageResponse<T>>,
    options: PagedOptionsStateOptions = {},
  ) {
    this.pageSize = options.pageSize ?? 10;
    this.errorMessage = options.errorMessage ?? 'Errore durante il caricamento delle opzioni:';
    this.searchDebounceMs = options.searchDebounceMs ?? 300;
    this.requests
      .pipe(
        switchMap(({ page, query, debounce }) => {
          this.loading.set(true);
          this.error.set(null);

          return timer(debounce ? this.searchDebounceMs : 0).pipe(
            switchMap(() => this.fetchPage(page, this.pageSize, query)),
            tap((response) => {
              this.options.set(response.content);
              this.page.set(response.pageNumber);
              this.totalPages.set(response.totalPages);
            }),
            catchError((error: unknown) => {
              console.error(this.errorMessage, error);
              this.error.set(this.errorMessage);
              return EMPTY;
            }),
            finalize(() => this.loading.set(false)),
          );
        }),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe();
  }

  load(): void {
    this.requestPage(this.page(), false);
  }

  search(query: string): void {
    const normalizedQuery = query.trim();
    this.query.set(normalizedQuery);
    this.page.set(0);
    this.requestPage(0, true);
  }

  goToPage(page: number): void {
    if (!Number.isInteger(page) || page < 0 || page >= this.totalPages()) {
      return;
    }

    this.requestPage(page, false);
  }

  private requestPage(page: number, debounce: boolean): void {
    this.requests.next({
      page,
      query: this.query(),
      debounce,
    });
  }
}