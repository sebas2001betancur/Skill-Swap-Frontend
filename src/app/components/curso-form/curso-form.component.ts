import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; // <-- IMPORTANTE
import { CursoService, CreateCursoPayload } from '../../services/curso.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-curso-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './curso-form.component.html',
})
export class CursoFormComponent implements OnInit {
    cursoForm: FormGroup;
    isSubmitting = false;
    isEditMode = false;
    cursoId: string | null = null;
    error: string | null = null;

    constructor(
        private fb: FormBuilder,
        private cursoService: CursoService,
        public router: Router,
        private route: ActivatedRoute // <-- Para leer parámetros de la URL
    ) {
        this.cursoForm = this.fb.group({
            nombre: ['', [Validators.required, Validators.maxLength(100)]],
            descripcion: ['', Validators.required],
            categoria: ['', Validators.required],
            nivel: ['', Validators.required],
            precio: [0, [Validators.required, Validators.min(0)]]
        });
    }

    showError(controlName: string): boolean {
  const control = this.cursoForm.get(controlName);
  return control ? control.invalid && (control.dirty || control.touched) : false;
}

    ngOnInit(): void {
        // Comprobar si hay un 'id' en los parámetros de la ruta.
        this.cursoId = this.route.snapshot.paramMap.get('id');
        this.isEditMode = !!this.cursoId;

        if (this.isEditMode && this.cursoId) {
            // Si estamos en modo edición, necesitamos cargar los datos del curso.
            // (Necesitaremos añadir un método getCursoById al servicio)
            this.cursoService.getCursoById(this.cursoId).subscribe(curso => {
                this.cursoForm.patchValue(curso); // Rellena el formulario con los datos
            });
        }
    }
  
    onSubmit(): void {
        if (this.cursoForm.invalid) {
            this.cursoForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;
        this.error = null;
        const cursoPayload: CreateCursoPayload = this.cursoForm.value;

        if (this.isEditMode && this.cursoId) {
            // Lógica para ACTUALIZAR
            this.cursoService.updateCurso(this.cursoId, cursoPayload).subscribe({
                next: () => this.router.navigate(['/cursos']),
                error: (err) => {
                    this.error = 'Error al actualizar el curso.';
                    this.isSubmitting = false;
                    console.error(err);
                }
            });
        } else {
            // Lógica para CREAR
            this.cursoService.createCurso(cursoPayload).subscribe({
                next: () => this.router.navigate(['/cursos']),
                error: (err) => {
                    this.error = 'Error al crear el curso.';
                    this.isSubmitting = false;
                    console.error(err);
                }
            });
        }
    }
}