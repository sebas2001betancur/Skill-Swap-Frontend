import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisIntercambiosComponent } from './mis-intercambios.component';

describe('MisIntercambiosComponent', () => {
  let component: MisIntercambiosComponent;
  let fixture: ComponentFixture<MisIntercambiosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisIntercambiosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisIntercambiosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
