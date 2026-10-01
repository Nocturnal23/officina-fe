import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterventionCardView } from './intervention-card-view';

describe('InterventionCardView', () => {
  let component: InterventionCardView;
  let fixture: ComponentFixture<InterventionCardView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterventionCardView],
    }).compileComponents();

    fixture = TestBed.createComponent(InterventionCardView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
