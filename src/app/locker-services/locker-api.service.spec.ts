import { TestBed } from '@angular/core/testing';

import { LockerApiService } from './locker-api.service';

describe('LockerApiService', () => {
  let service: LockerApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LockerApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
