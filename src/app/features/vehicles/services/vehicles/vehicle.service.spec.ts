import { TestBed } from '@angular/core/testing';

import { Vehicle } from './vehicle.service';

describe('Vehicle', () => {
  let service: Vehicle;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VehicleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
