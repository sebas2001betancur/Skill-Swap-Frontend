import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

// Services
import { CursoService } from '../../services/curso.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { WompiService } from '../../services/wompi.service';

// Models
import { Curso } from '../../models/curso';

@Component({
  selector: 'app-comprar-curso',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './comprar-curso.component.html',
  styleUrl: './comprar-curso.component.scss'
})
export class ComprarCursoComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cursoService = inject(CursoService);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly wompiService = inject(WompiService);

  curso$!: Observable<Curso>;
  isLoading = true;
  cursoId: string;

  constructor() {
    this.cursoId = this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.cargarCurso();
  }

  private cargarCurso(): void {
    this.isLoading = true;
    this.curso$ = this.cursoService.getCursoById(this.cursoId);
    // Simular carga
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  procederAlPago(): void {
    // TODO: Implementar integración con Wompi
    this.notificationService.showInfo('Integración de pagos próximamente disponible');
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
}
