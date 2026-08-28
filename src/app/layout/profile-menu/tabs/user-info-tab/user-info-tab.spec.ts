import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserInfoTab } from './user-info-tab';

describe('UserInfoTab', () => {
  let component: UserInfoTab;
  let fixture: ComponentFixture<UserInfoTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserInfoTab],
    }).compileComponents();

    fixture = TestBed.createComponent(UserInfoTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
