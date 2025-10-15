import { TestBed } from '@angular/core/testing';

import { TutoriaService } from './tutoria.service';

describe('TutoriaService', () => {
  let service: TutoriaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TutoriaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
