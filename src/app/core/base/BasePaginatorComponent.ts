import { Directive, signal } from '@angular/core';
import { PageResponse } from '../../models/pagination.model';

@Directive() 
export abstract class BasePaginatorComponent<T> {
    dataList = signal<T[]>([]);
    currentPage = signal<number>(0);
    pageSize = signal<number>(3);
    totalPages = signal<number>(0);
    isLastPage = signal<boolean>(true);

    nextPage() {
        if (!this.isLastPage()) {
            this.currentPage.update(p => p + 1);
            this.loadData();
        }
    }

    prevPage() {
        if (this.currentPage() > 0) {
            this.currentPage.update(p => p - 1);
            this.loadData();
        }
    }

    protected updatePaginationState(response: PageResponse<T>) {
        this.dataList.set(response.content);
        this.totalPages.set(response.totalPages);
        this.isLastPage.set(response.last);
    }

    protected abstract loadData(): void;
}