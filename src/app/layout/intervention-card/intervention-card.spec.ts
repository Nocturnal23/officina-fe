import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterventionCard } from './intervention-card';

describe('InterventionCard', () => {
  let component: InterventionCard;
  let fixture: ComponentFixture<InterventionCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterventionCard],
    }).compileComponents();

    fixture = TestBed.createComponent(InterventionCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
