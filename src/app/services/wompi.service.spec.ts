import { TestBed } from '@angular/core/testing';

import { WompiService } from './wompi.service';

describe('WompiService', () => {
  let service: WompiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WompiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
