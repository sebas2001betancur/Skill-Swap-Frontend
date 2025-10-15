import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvertirMentorComponent } from './convertir-mentor.component';

describe('ConvertirMentorComponent', () => {
  let component: ConvertirMentorComponent;
  let fixture: ComponentFixture<ConvertirMentorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConvertirMentorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConvertirMentorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
