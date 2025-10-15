import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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

// Models
import { Curso } from '../../models/curso';

@Component({
  selector: 'app-mis-cursos-comprados',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './mis-cursos-comprados.component.html',
  styleUrl: './mis-cursos-comprados.component.scss'
})
export class MisCursosCompradosComponent implements OnInit {

  private readonly cursoService = inject(CursoService);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  cursosComprados: Curso[] = [];
  isLoading = true;

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.cargarCursosComprados();
  }

  private cargarCursosComprados(): void {
    this.isLoading = true;

    this.cursoService.getCursosComprados().subscribe({
      next: (cursos) => {
        this.cursosComprados = cursos || [];
        this.isLoading = false;
        console.log('Cursos comprados cargados:', this.cursosComprados.length);
      },
      error: (error) => {
        console.error('Error cargando cursos comprados:', error);
        this.notificationService.showError('Error al cargar tus cursos comprados');
        this.isLoading = false;
      }
    });
  }

   verCurso(): void {
     // TODO: Implementar vista del curso adquirido
     this.notificationService.showInfo('Vista del curso próximamente disponible');
   }

   descargarCertificado(): void {
     // TODO: Implementar descarga de certificado
     this.notificationService.showInfo('Descarga de certificado próximamente disponible');
   }

   dejarResena(): void {
     // TODO: Implementar sistema de reseñas
     this.notificationService.showInfo('Sistema de reseñas próximamente disponible');
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

  formatFecha(fecha: string | Date | undefined): string {
    const date = fecha ? new Date(fecha) : new Date();
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
