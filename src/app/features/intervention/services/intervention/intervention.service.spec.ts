import { TestBed } from '@angular/core/testing';

import { Intervention } from './intervention.service';

describe('Intervention', () => {
  let service: Intervention;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InterventionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
