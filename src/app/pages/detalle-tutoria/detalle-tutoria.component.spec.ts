import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleTutoriaComponent } from './detalle-tutoria.component';

describe('DetalleTutoriaComponent', () => {
  let component: DetalleTutoriaComponent;
  let fixture: ComponentFixture<DetalleTutoriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleTutoriaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleTutoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});