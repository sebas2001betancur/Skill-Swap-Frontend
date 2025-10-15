// src/app/pages/calificaciones-tutoria/calificaciones-tutoria.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalificacionesTutoriaComponent } from './calificaciones-tutoria.component';

describe('CalificacionesTutoriaComponent', () => {
  let component: CalificacionesTutoriaComponent;
  let fixture: ComponentFixture<CalificacionesTutoriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalificacionesTutoriaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalificacionesTutoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});