import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';



// Services
import { CursoService } from '../../services/curso.service';
import { IntercambioService } from '../../services/intercambio.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';

// Models
import { Curso } from '../../models/curso';

@Component({
  selector: 'app-proponer-intercambio',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatChipsModule
  ],
  templateUrl: './proponer-intercambio.component.html',
  styleUrl: './proponer-intercambio.component.scss'
})
export class ProponerIntercambioComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly cursoService = inject(CursoService);
  private readonly intercambioService = inject(IntercambioService);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);

  cursoSolicitado$!: Observable<Curso>;
  misCursos$!: Observable<Curso[]>;
  intercambioForm: FormGroup;
  cursoSolicitadoId: string;
  isSubmitting = false;
  isLoading = true;

  constructor() {
    this.cursoSolicitadoId = this.route.snapshot.paramMap.get('id')!;
    this.intercambioForm = this.fb.group({
      cursoOfrecidoId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    this.isLoading = true;

    // Cargar curso solicitado
    this.cursoSolicitado$ = this.cursoService.getCursoById(this.cursoSolicitadoId);

    // Cargar mis cursos
    this.misCursos$ = this.cursoService.getMisCursos();

    // Marcar como cargado después de un pequeño delay para mejor UX
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  onSubmit(): void {
    if (this.intercambioForm.invalid) {
      this.notificationService.showError('Por favor selecciona un curso para ofrecer');
      return;
    }

    this.isSubmitting = true;
    const cursoOfrecidoId = this.intercambioForm.value.cursoOfrecidoId;

    this.intercambioService.createPropuesta(this.cursoSolicitadoId, cursoOfrecidoId).subscribe({
      next: () => {
        this.notificationService.showSuccess('¡Propuesta de intercambio enviada con éxito!');
        this.router.navigate(['/mis-intercambios']);
      },
      error: (err) => {
        console.error('Error enviando propuesta:', err);
        this.notificationService.showError(err.error?.message || 'Ocurrió un error al enviar la propuesta');
        this.isSubmitting = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/cursos']);
  }

  getNivelColor(nivel: string): string {
    switch (nivel.toLowerCase()) {
      case 'principiante':
        return 'primary';
      case 'intermedio':
        return 'accent';
      case 'avanzado':
        return 'warn';
      default:
        return 'primary';
    }
  }

  formatPrecio(precio: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'COP'
    }).format(precio);
  }

  getCursoOfrecidoNombre(misCursos: Curso[]): string {
    const cursoId = this.intercambioForm.value.cursoOfrecidoId;
    const curso = misCursos.find(c => c.id === cursoId);
    return curso?.nombre || '';
  }

  getCursoOfrecidoPrecio(misCursos: Curso[]): string {
    const cursoId = this.intercambioForm.value.cursoOfrecidoId;
    const curso = misCursos.find(c => c.id === cursoId);
    return curso ? this.formatPrecio(curso.precio) : '';
  }
}