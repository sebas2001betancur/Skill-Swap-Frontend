import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisTutoriasComponent } from './mis-tutorias.component';

describe('MisTutoriasComponent', () => {
  let component: MisTutoriasComponent;
  let fixture: ComponentFixture<MisTutoriasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisTutoriasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisTutoriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
