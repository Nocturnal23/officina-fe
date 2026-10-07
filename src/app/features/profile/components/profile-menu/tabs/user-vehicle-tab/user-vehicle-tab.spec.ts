import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserVehicleTab } from './user-vehicle-tab';

describe('UserVehicleTab', () => {
  let component: UserVehicleTab;
  let fixture: ComponentFixture<UserVehicleTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserVehicleTab],
    }).compileComponents();

    fixture = TestBed.createComponent(UserVehicleTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
