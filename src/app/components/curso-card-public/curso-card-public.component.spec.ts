import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CursoCardPublicComponent } from './curso-card-public.component';

describe('CursoCardPublicComponent', () => {
  let component: CursoCardPublicComponent;
  let fixture: ComponentFixture<CursoCardPublicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CursoCardPublicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CursoCardPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
