import { TestBed } from '@angular/core/testing';

import { MibandService } from './miband.service';

describe('MibandService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MibandService = TestBed.get(MibandService);
    expect(service).toBeTruthy();
  });
});
