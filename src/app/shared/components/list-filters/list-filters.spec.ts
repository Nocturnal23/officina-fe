import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFilters } from './list-filters';

describe('ListFilters', () => {
  let component: ListFilters;
  let fixture: ComponentFixture<ListFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListFilters],
    }).compileComponents();

    fixture = TestBed.createComponent(ListFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
