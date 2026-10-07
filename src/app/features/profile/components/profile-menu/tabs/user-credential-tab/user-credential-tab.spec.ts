import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCredentialTab } from './user-credential-tab';

describe('UserCredentialTab', () => {
  let component: UserCredentialTab;
  let fixture: ComponentFixture<UserCredentialTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCredentialTab],
    }).compileComponents();

    fixture = TestBed.createComponent(UserCredentialTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
