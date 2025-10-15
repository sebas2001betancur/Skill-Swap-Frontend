import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CursoCardPrivateComponent } from './curso-card-private.component';

describe('CursoCardPrivateComponent', () => {
  let component: CursoCardPrivateComponent;
  let fixture: ComponentFixture<CursoCardPrivateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CursoCardPrivateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CursoCardPrivateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
