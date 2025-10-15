import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearTutoriaComponent } from './crear-tutoria.component';

describe('CrearTutoriaComponent', () => {
  let component: CrearTutoriaComponent;
  let fixture: ComponentFixture<CrearTutoriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearTutoriaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearTutoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
