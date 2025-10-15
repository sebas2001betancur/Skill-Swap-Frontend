import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProponerIntercambioComponent } from './proponer-intercambio.component';

describe('ProponerIntercambioComponent', () => {
  let component: ProponerIntercambioComponent;
  let fixture: ComponentFixture<ProponerIntercambioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProponerIntercambioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProponerIntercambioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
