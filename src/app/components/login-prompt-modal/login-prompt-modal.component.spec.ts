import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginPromptModalComponent } from './login-prompt-modal.component';

describe('LoginPromptModalComponent', () => {
  let component: LoginPromptModalComponent;
  let fixture: ComponentFixture<LoginPromptModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPromptModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginPromptModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
