import { TestBed } from '@angular/core/testing';

import { Job } from './job.service';

describe('Job', () => {
  let service: Job;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JobService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
