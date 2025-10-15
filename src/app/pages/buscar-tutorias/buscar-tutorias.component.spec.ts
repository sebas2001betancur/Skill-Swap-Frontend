import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarTutoriasComponent } from './buscar-tutorias.component';

describe('BuscarTutoriasComponent', () => {
  let component: BuscarTutoriasComponent;
  let fixture: ComponentFixture<BuscarTutoriasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscarTutoriasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscarTutoriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});