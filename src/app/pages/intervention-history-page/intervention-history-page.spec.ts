import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterventionHistoryPage } from './intervention-history-page';

describe('InterventionHistoryPage', () => {
  let component: InterventionHistoryPage;
  let fixture: ComponentFixture<InterventionHistoryPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterventionHistoryPage],
    }).compileComponents();

    fixture = TestBed.createComponent(InterventionHistoryPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
