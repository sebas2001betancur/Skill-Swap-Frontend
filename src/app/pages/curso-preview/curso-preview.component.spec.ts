import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CursoPreviewComponent } from './curso-preview.component';

describe('CursoPreviewComponent', () => {
  let component: CursoPreviewComponent;
  let fixture: ComponentFixture<CursoPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CursoPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CursoPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
