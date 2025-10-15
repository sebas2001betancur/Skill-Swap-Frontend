import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPerfilMentorComponent } from './editar-perfil-mentor.component';

describe('EditarPerfilMentorComponent', () => {
  let component: EditarPerfilMentorComponent;
  let fixture: ComponentFixture<EditarPerfilMentorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarPerfilMentorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarPerfilMentorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
