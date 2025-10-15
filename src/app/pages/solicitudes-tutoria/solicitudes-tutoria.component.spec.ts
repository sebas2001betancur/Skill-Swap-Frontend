// src/app/pages/solicitudes-tutoria/solicitudes-tutoria.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudesTutoriaComponent } from './solicitudes-tutoria.component';

describe('SolicitudesTutoriaComponent', () => {
  let component: SolicitudesTutoriaComponent;
  let fixture: ComponentFixture<SolicitudesTutoriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudesTutoriaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudesTutoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});