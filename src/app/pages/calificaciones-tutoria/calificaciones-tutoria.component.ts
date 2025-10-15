// src/app/pages/calificaciones-tutoria/calificaciones-tutoria.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

// Services
import { TutoriaService } from '../../services/tutoria.service';
import { NotificationService } from '../../services/notification.service';

// Models
import { CalificacionTutoriaDto } from '../../models/tutoria';

@Component({
  selector: 'app-calificaciones-tutoria',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './calificaciones-tutoria.component.html',
  styleUrls: ['./calificaciones-tutoria.component.scss']
})
export class CalificacionesTutoriaComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tutoriaService = inject(TutoriaService);
  private readonly notificationService = inject(NotificationService);

  calificaciones: CalificacionTutoriaDto[] = [];
  isLoading = true;
  tutoriaId = '';

  ngOnInit(): void {
    this.tutoriaId = this.route.snapshot.paramMap.get('id') || '';
    if (this.tutoriaId) {
      this.cargarCalificaciones();
    } else {
      this.router.navigate(['/mis-tutorias']);
    }
  }

  private cargarCalificaciones(): void {
    this.isLoading = true;
    this.tutoriaService.getCalificacionesTutoria(this.tutoriaId).subscribe({
      next: (calificaciones) => {
        this.calificaciones = calificaciones;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar calificaciones:', error);
        this.notificationService.showError('No se pudieron cargar las calificaciones');
        this.isLoading = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/tutorias', this.tutoriaId]);
  }

  getEstrellas(puntuacion: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i < puntuacion ? 1 : 0);
  }
}