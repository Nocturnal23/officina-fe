import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingCardView } from './booking-card-view';

describe('BookingCardView', () => {
  let component: BookingCardView;
  let fixture: ComponentFixture<BookingCardView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingCardView],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingCardView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
