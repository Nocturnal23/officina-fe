import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesCard } from './services-card';

describe('ServicesCard', () => {
  let component: ServicesCard;
  let fixture: ComponentFixture<ServicesCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicesCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ServicesCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
